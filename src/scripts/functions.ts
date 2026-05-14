import type {Client,Params,TotalSales,Article,PurchaseWithClient,DetailPerAr,BoolSetter} from "@/context/types";
import {insertCharacter,printDate} from "@/context/utilityFunctions";
import jsPDF from "jspdf";
import autoTable,{ type RowInput, type UserOptions } from 'jspdf-autotable';


declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
const nextY = (doc: jsPDF, offset = 10) => (doc.lastAutoTable?.finalY ?? 0) + offset;
type TableHead = RowInput[];
type TableBody = RowInput[];
const primaryColorPdf : [number,number,number] = [73,80,87];
const secondaryColorPdf : [number, number, number]= [108,117,125];
const yellow : [number,number,number] = [201,162,39];
const green : [number,number,number] = [64,145,108];
const darkTextPdf : [number,number,number] = [33,37,41];
const lightTextPdf : [number,number,number] = [248,249,250];

export const generatePDF = (startDate:string,endDate:string,clientInfo:Client,systemParams:Params,totalSales:TotalSales,articlesSold:Article[],
  clientSubscriptions:Client[],downlinePurchases:PurchaseWithClient[],palier:string,downlineSubs:number,details:DetailPerAr[],setLoadingPdf:BoolSetter,op:string) => {
    setLoadingPdf(true);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Add Image
    const imgData = 'images/golombe2.png'; // Replace with your base64 image data or URL
    doc.addImage(imgData, 'PNG', pageWidth - 47, 0, 35, 25); // Adjust the position and size of the image

    // Add Header
    doc.setFontSize(12);
    doc.setFont("courier", "bold");
    doc.setFillColor(darkTextPdf[0],darkTextPdf[1],darkTextPdf[2]);
    doc.text('Bilan PV et Ristournes Client', 15, 10, { align: "left" });

    // Add Period
    doc.setFontSize(8);
    doc.text(`Période Du: ${startDate} au ${endDate}`, 15, 15,{ align: "left" });

    // Add Client Info
    insertTable(doc,"Info Client",25,[["Client","N° WhatsApp","N° Compte"]],[[clientInfo?.nom,clientInfo?.numtel,clientInfo?.numcompte]]);

    // Add Chiffre d'Affaire Table
    const caData = [
      [
        systemParams && totalSales
          ? insertCharacter(Math.round(((totalSales.totalvente*100) / (systemParams.tva + 100))).toString())
          : 'N/A',
        systemParams && totalSales
          ? insertCharacter(Math.round((systemParams.tva *  ((totalSales.totalvente*100) / (systemParams.tva + 100)))/100).toString())
          : 'N/A',
        insertCharacter((totalSales?.totalvente ?? 0).toString()),
      ],
    ];
    insertTable(doc, 'Paramètres', nextY(doc, 10), [['CA HT', `TVA (${systemParams?.tva} %)`, 'CA TTC']], caData);

    // Add Achats et PV Correspondants Table
    const articlesData = articlesSold?.map((article) => [
      article.libelle,
      article.qte.toString(),
      article.points.toString(),
      (article.qte * article.points).toString(),
    ]);
    if (articlesData) {
      articlesData.push([
        'Totaux',
        articlesSold ? articlesSold.reduce((acc, article) => acc + article.qte, 0).toString() : "NA",
        '/',
        articlesSold ? articlesSold.reduce((acc, article) => acc + article.qte * article.points, 0).toString() : "NA",
      ]);
      insertTable(doc,'Achats et PV Correspondants',
        nextY(doc, 10),[['Libelle', 'Qte', 'PV au Colis', 'Total PV']],articlesData);
    }

    // Add Abonnement et Parrainages Table
    const subscriptionsData = clientSubscriptions.map((client) => [
      client.id_client,
      client.nom,
      client.numtel,
      printDate(client.d_creation),
    ]);

    if(subscriptionsData){
      subscriptionsData.push([
        'Totaux',
        `Nombre d'abonnement(s) : ${clientSubscriptions.length}`,
        `PV abonnement : ${clientSubscriptions.length * 35}`,
        '',
      ]);
      insertTable(doc,'Abonnement et/ou Parrainage(s) effectué(s)',
        nextY(doc, 10),[['Code client', 'Nom et prénoms', 'N° Tel', 'Date Abonnement']],subscriptionsData);
    }

    // Add Achats et PV Correspondants des Downlines
    addStyledHeading(doc, 'Achats et PV Correspondants des Downlines', nextY(doc, 10));
    downlinePurchases?.forEach((pc,index) => {
      const purchasesData = pc.purchases.map((purchase) => [
        purchase.libelle,
        purchase.qte.toString(),
        purchase.points.toString(),
        (purchase.qte * purchase.points).toString(),
      ]);
      purchasesData.push([
        'Sous-Total',
        pc.purchases.reduce((acc, purchase) => acc + purchase.qte, 0).toString(),
        '/',
        pc.purchases.reduce((acc, purchase) => acc + purchase.qte * purchase.points, 0).toString(),
      ]);
      let width;
      if (index == 0) {
        width = nextY(doc,20);
      }else{
        width = nextY(doc, 10);
      }
      insertTable(doc,`${pc.nom} (${pc.client})`,width,
        [['Libelle', 'Qte', 'PV au Colis', 'Total PV']],purchasesData);
    });

    // Add Total PV
    const downlines = downlinePurchases ? insertCharacter(downlinePurchases.reduce((acc, dn) => acc + dn.purchases.reduce((a, p) => a + p.qte * p.points, 0), 0).toString()) : "NA"
    addStyledHeading(doc,`Total PV Downline(s) : ${downlines}`,nextY(doc, 10));

    const totalPv = insertCharacter((downlinePurchases.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) + (clientSubscriptions.length * 35) + articlesSold.reduce((acc,article)=> acc + (article.qte * article.points),0)).toString())
    addStyledHeading(doc,`Total PV : ${totalPv}`,nextY(doc,20),green);

    // Add Calcul Correspondante
    insertTable(doc, "Calcul de la Ristourne Correspondante", nextY(doc,30), [["Libelle", "Qte", "Valeur Unitaire", "Valeur Totale"]], [
      ["Total des PV", insertCharacter((downlinePurchases.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) + (clientSubscriptions.length * 35) + articlesSold.reduce((acc,article)=> acc + (article.qte * article.points),0)).toString()), "/", `Palier: ${palier}`],
      [`Abonnement (${printDate(clientInfo?.d_creation)})`, "1", insertCharacter(systemParams.valabonnementpropre.toString()), insertCharacter(systemParams.valabonnementpropre.toString())],
      ["Parrainage downline(s)", `${downlineSubs}`, `${systemParams?insertCharacter(systemParams.valabonnement.toString()):"NA"}`, `${systemParams
        ?insertCharacter((downlineSubs * Number(systemParams.valabonnement ?? 0)).toString())
        :"NA"}`]
    ])

    // Add Achats Correspondante
    insertTable(doc, "Achats et Ristournes Correspondants", nextY(doc, 10), [["Libelle", "Qte", "Valeur Unitaire (F CFA)", "Valeur Totale (F CFA)"]], details.map(d => [d.libelle, d.ttqtesortie, insertCharacter(d.valpvar.toString()), insertCharacter(d.valar.toString())]));

    // Add Montant Ristourne
    const subTotal =  insertCharacter((details.reduce((acc,dv)=>acc+Number(dv.valar),0) ?? 0).toString())
    addStyledHeading(doc,`Sous Total Achats: ${subTotal} F CFA`,nextY(doc, 10));

    // Add Montant Ristourne
    const totalR = insertCharacter((
      (details.reduce((acc,dv)=>acc+Number(dv.valar),0)) +
      (downlineSubs * Number(systemParams.valabonnement ?? 0) +
      +((clientInfo.d_creation >= startDate && clientInfo.d_creation <= endDate) ? systemParams.valabonnementpropre:0))
    ).toString())

    addStyledHeading(doc,`MONTANT RISTOURNE: ${totalR} F CFA`, nextY(doc,25),yellow);

    // Add Footer
    doc.setFontSize(10);
    doc.setTextColor(darkTextPdf[0],darkTextPdf[1],darkTextPdf[2]);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 295, { align: "center" });

    if(op=='DOWNLOAD'){
      // Save PDF
      doc.save(`Bilan ${clientInfo?.nom}.pdf`);
      setLoadingPdf(false);
    }else if(op == 'PRINT'){
      const pdfUrl = doc.output("bloburl");
      window.open(pdfUrl)
    }

  };

  const addStyledSubheading = (doc: jsPDF, text: string, y: number,marginX = 14) => {
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - 2 * marginX; // Width respecting margins
    const rectHeight = 8; // Compact height

    // Background color (respects margins)
    doc.setFillColor(primaryColorPdf[0],primaryColorPdf[1],primaryColorPdf[2]);
    doc.rect(marginX, y - rectHeight / 2, contentWidth, rectHeight, 'F');

    // White text, centered within the content area
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(lightTextPdf[0],lightTextPdf[1],lightTextPdf[2]); // White text
    doc.text(text, pageWidth / 2, y + rectHeight / 4, { align: "center" });
  };

  const addStyledHeading = (doc: jsPDF, text: string, y: number,c = primaryColorPdf, marginX = 14) => {
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - 2 * marginX; // Width respecting margins
    const rectHeight = 8; // Compact height

    // Background color (respects margins)
    doc.setFillColor(c[0],c[1],c[2]);
    doc.rect(marginX, y - rectHeight / 2, contentWidth, rectHeight, 'F');

    // White text, centered within the content area
    doc.setFont("courier", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(lightTextPdf[0],lightTextPdf[1],lightTextPdf[2]); // White text
    doc.text(text, pageWidth / 2, y + rectHeight / 4, { align: "center" });
  };

const insertTable = (doc: jsPDF, title: string, startY: number, head: TableHead, body: TableBody) => {
    addStyledSubheading(doc, title, startY);
    autoTable(doc, {
      startY: startY + 5,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: secondaryColorPdf },
      alternateRowStyles: { fillColor: lightTextPdf },
      styles : {fontSize: 8,font:"courier",fontStyle: "bold",},
    });
  };