import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { psql } from "@/scripts/conn";

dotenv.config();

export async function POST(req: Request) {

  const { client, startDate, endDate } = await req.json();

  if (!client || !startDate || !endDate) {

    console.log(client, startDate, endDate);

    return NextResponse.json(
      { success: false, error: "Missing required parameters" },
      { status: 400 }
    );

  }

  try {

    // Query 1
    const clientInfo = await psql`
      SELECT ID_CLIENT, EMAIL, NOM, D_CREATION, NUMTEL, NUMCOMPTE
      FROM public."client"
      WHERE ID_CLIENT = ${client}
    `;

    // Query 2
    const systemParams = await psql`
      SELECT * FROM public."parametre"
    `;

    // Query 3
    const totalSales = await psql`
      SELECT ST.ID_SORTIESTOCK, SUM(AV.PRIXVENTE) AS TOTALVENTE
      FROM public."sortie_stock" ST
      JOIN public."articlevendu" AV
        ON ST.ID_SORTIESTOCK = AV.ID_SORTIESTOCK
      WHERE ST.DATESORTIESTOCK BETWEEN ${startDate} AND ${endDate}
      AND ST.ID_CLIENT = ${client}
      AND ST.STATUT = 'V'
      GROUP BY ST.ID_SORTIESTOCK
    `;

    // Query 4
    const articlesSold = await psql`
      SELECT AV.ID_ARTICLE,
             SUM(AV.QTESORTIE) AS QTE,
             A.LIBELLE,
             A.POINTS
      FROM public."articlevendu" AV
      JOIN public."sortie_stock" ST
        ON AV.ID_SORTIESTOCK = ST.ID_SORTIESTOCK
      JOIN public."article" A
        ON A.ID_ARTICLE = AV.ID_ARTICLE
      WHERE ST.ID_CLIENT = ${client}
      AND ST.DATESORTIESTOCK BETWEEN ${startDate} AND ${endDate}
      AND ST.STATUT = 'V'
      GROUP BY AV.ID_ARTICLE, A.LIBELLE, A.POINTS
    `;

    // Query 5
    const clientSubscriptions = await psql`
      SELECT ID_CLIENT, NOM, NUMTEL, D_CREATION
      FROM public."client"
      WHERE (ID_CLIENT = ${client}
      OR ID_PARRAIN = ${client})
      AND D_CREATION BETWEEN ${startDate} AND ${endDate}
    `;

    const downlineSubscriptions = await psql`
      SELECT count(*)
      FROM public."client"
      WHERE ID_PARRAIN = ${client}
      AND D_CREATION BETWEEN ${startDate} AND ${endDate}
    `;

    // Query 6
    const downlineClients = await psql`
      SELECT DISTINCT C.ID_CLIENT, C.NOM
      FROM public."client" C
      JOIN public."sortie_stock" ST
        ON C.ID_CLIENT = ST.ID_CLIENT
      WHERE C.ID_PARRAIN = ${client}
      AND ST.DATESORTIESTOCK BETWEEN ${startDate} AND ${endDate}
      AND ST.STATUT = 'V'
    `;

    // Query 7
    const downlinePurchases = [];

    for (const client of downlineClients) {

      const purchases = await psql`
        SELECT A.LIBELLE,
               A.POINTS,
               SUM(AV.QTESORTIE) AS QTE,
               AV.ID_ARTICLE
        FROM public."article" A
        JOIN public."articlevendu" AV
          ON A.ID_ARTICLE = AV.ID_ARTICLE
        JOIN public."sortie_stock" ST
          ON AV.ID_SORTIESTOCK = ST.ID_SORTIESTOCK
        WHERE ST.ID_CLIENT = ${client.id_client}
        AND ST.DATESORTIESTOCK
          BETWEEN ${startDate} AND ${endDate}
        AND ST.STATUT = 'V'
        GROUP BY AV.ID_ARTICLE, A.LIBELLE, A.POINTS
      `;

      downlinePurchases.push({
        client: client.id_client,
        nom: client.nom,
        purchases
      });

    }

    // PV calculation
    const ttbilanpvnetInt =
      articlesSold.reduce(
        (acc: number, article) =>
          acc + Number(article.qte) * Number(article.points),
        0
      ) + clientSubscriptions.length * 35;

    let palier;
    let results;

    if (ttbilanpvnetInt >= 120) {

      palier = 2;

      results = await psql`
        SELECT a.id_article,
               a.libelle,
               sum(av.qtesortie) as ttqtesortie
        FROM public."article" a
        JOIN public."articlevendu" av
          ON a.id_article = av.id_article
        JOIN public."sortie_stock" st
          ON st.id_sortiestock = av.id_sortiestock
        JOIN public."client" c
          ON st.id_client = c.id_client
        WHERE st.datesortiestock
          BETWEEN ${startDate} AND ${endDate}
        AND st.STATUT = 'V'
        AND (
          c.id_client = ${clientInfo[0].id_client}
          OR c.id_parrain = ${clientInfo[0].id_client}
        )
        GROUP BY a.id_article, a.libelle
      `;

    } else {

      palier = 1;

      results = await psql`
        SELECT a.id_article,
               a.libelle,
               sum(av.qtesortie) as ttqtesortie
        FROM public."article" a
        JOIN public."articlevendu" av
          ON a.id_article = av.id_article
        JOIN public."sortie_stock" st
          ON st.id_sortiestock = av.id_sortiestock
        JOIN public."client" c
          ON st.id_client = c.id_client
        WHERE st.datesortiestock
          BETWEEN ${startDate} AND ${endDate}
        AND st.STATUT = 'V'
        AND c.id_client = ${clientInfo[0].id_client}
        GROUP BY a.id_article, a.libelle
      `;

    }

    let valtotalar = 0;
    const details = [];

    for (const row of results) {

      const { id_article, libelle, ttqtesortie } = row;

      const valpvarResults = await psql`
        SELECT MONTANT
        FROM public."val_pv_article"
        WHERE ID_ARTICLE = ${id_article}
        AND ID_PALIER = ${palier}
      `;

      let valpvar = 0;

      if (valpvarResults.length > 0) {
        valpvar = Number(valpvarResults[0].montant);
      }

      const valar = Number(ttqtesortie) * valpvar;

      valtotalar += valar;

      details.push({
        libelle,
        ttqtesortie,
        valpvar,
        valar
      });

    }

    console.log(details);

    const Valabonnementpropre = 100;
    const valdownlines = 50;

    const mtristourne =
      Valabonnementpropre +
      valdownlines +
      valtotalar;

    return NextResponse.json({
      success: true,
      rows: {
        clientInfo,
        systemParams,
        totalSales,
        articlesSold,
        clientSubscriptions,
        downlineClients,
        downlinePurchases,
        palier,
        downlineSubscriptions,
        global: {
          details,
          valtotalar,
          mtristourne
        }
      }
    });

  } catch (e) {

    if (e instanceof Error) {

      console.log(e, "error occurs here");

      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );

    }

    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    );

  }

}