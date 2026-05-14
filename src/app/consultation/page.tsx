"use client";
import { useState,useEffect,useCallback } from "react";
import {useRouter} from "next/navigation";
import styles from "./page.module.css";
import Nav from "@/components/nav/component";
import Card from "@/components/card/components";
import DownlineAccordion from "@/components/downlineCard/component";
import {insertCharacter,printDate} from "@/context/utilityFunctions";
import type {Client,Params,TotalSales,Article,PurchaseWithClient,DetailPerAr,BoolSetter} from '@/context/types';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/loadingOverlay/component';
import { useForm, useWatch } from "react-hook-form";
import {generatePDF} from "@/scripts/functions";

type FilterForm = {
  client: string;
  startDate: string;
  endDate: string;
};

export default function ConsultationPage() {
  const r = useRouter();
  const [clients,setClients] = useState<Client[]>([]);
  const [loading,setLoading] = useState<boolean>(false);
  const [dataFetched,setDataFetched] = useState<boolean>(false);
  const [clientInfo,setclientInfo] = useState<Client>();
  const [systemParams,setsystemParams] = useState<Params>();
  const [totalSales,settotalSales] = useState<TotalSales>();
  const [articlesSold,setarticlesSold] = useState<Article[]>();
  const [clientSubscriptions,setclientSubscriptions] = useState<Client[]>([]);
  const [downlinePurchases,setdownlinePurchases] = useState<PurchaseWithClient[]>();
  const [palier,setPalier] = useState<string>('');
  const [details,setDetails] = useState<DetailPerAr[]>();
  const [loadingPdf,setLoadingPdf] = useState<boolean>(false);
  const [printLoadPdf,setPrintLoadPdf] = useState<boolean>(false);
  const [downlineSubs,setDownlineSubs] = useState<number>(0)

  const {
      register,
      handleSubmit,
      reset,
      control
    } = useForm<FilterForm>({
      defaultValues: {
        client: "",
        startDate: "2024-05-01",
        endDate: "2025-04-01",
      },
    });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const d = new Date()

  const onSubmit = async (data: FilterForm) => {
    setLoading(true)
    try {
      const response = await fetch("/api/protected/consultation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        const {clientInfo,
          systemParams,
          totalSales,
          articlesSold,
          clientSubscriptions,downlineSubscriptions,
          downlinePurchases,global,palier} = result.rows;
          console.log(downlinePurchases)
          setclientInfo(clientInfo[0]);
          settotalSales(totalSales[0]);
          setsystemParams(systemParams[0]);
          setarticlesSold(articlesSold);
          setclientSubscriptions(clientSubscriptions);
          setdownlinePurchases(downlinePurchases);
          setDetails(global.details);
          setPalier(palier);
          setDownlineSubs(downlineSubscriptions[0].count);
          setDataFetched(true);
      } else {
        toast.error('Connexion impossible, Vérifiez votre connexion internet puis réessayez ❌');
      }
    } catch (error) {
      console.error("Error :", error);
      toast.error('Connexion impossible, Vérifiez votre connexion internet puis réessayez ❌');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        r.replace("/connexion");
        return;
      }

      const response = await fetch("/api/protected/clients", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error('Connexion impossible, Vérifiez votre connexion internet puis réessayez ❌');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.rows);
      }
    } catch (err) {
      toast.error('Connexion impossible, Vérifiez votre connexion internet puis réessayez ❌');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [r]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function printMiddleware(operation:string,loader:BoolSetter){
    if(clientInfo && systemParams && totalSales && articlesSold && clientSubscriptions && downlinePurchases && palier && downlineSubs && details){
      generatePDF(startDate,endDate,clientInfo,systemParams,totalSales,articlesSold,clientSubscriptions,downlinePurchases,palier,downlineSubs,details,loader,operation)
    }
  }

  return (
    <>
      <LoadingOverlay show={loading}/>
      <div className={styles.page}>
        {/* TOPNAV */}
        <Nav />
        <main className={styles.main}>
          {/* PAGE HEADER */}
          <div className={`${styles.pageHeader} ${styles.noPrint}`}>
            <div className={styles.breadcrumb}>
              Tableau de bord
              <span>›</span>
              Bilan PV & Ristournes
            </div>

            <div className={styles.pageTitle}>
              Bilan PV et Ristournes Client
            </div>

            <div className={styles.pageSub}>
              Consultez le rapport détaillé par client et période
            </div>
          </div>

          {/* FILTER CARD*/}
          <Card
            title="Filtres de Recherche"
            subtitle="Sélectionnez un client, une période et un mot-clé"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.filterGrid}>
                <div className={styles.fgroup}>
                  <label className={styles.flabel}>
                    Client
                  </label>

                  <select
                    className={styles.fselect}
                    {...register("client")}
                  >
                    <option value="">Sélectionner un client</option>

                    {clients.map((client) => (
                      <option
                        key={client.id_client}
                        value={client.id_client}
                      >
                        {client.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fgroup}>
                  <label className={styles.flabel}>
                    Date de début
                  </label>

                  <input
                    className={styles.finput}
                    type="date"
                    {...register("startDate")}
                  />
                </div>

                <div className={styles.fgroup}>
                  <label className={styles.flabel}>
                    Date de fin
                  </label>

                  <input
                    className={styles.finput}
                    type="date"
                    {...register("endDate")}
                  />
                </div>

                <div className={styles.filterActions}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                  >
                    Rechercher
                  </button>

                  <button
                    type="button"
                    title="Réinitialiser"
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={() =>
                      reset({
                        client: "",
                        startDate: "2024-05-01",
                        endDate: "2025-04-01",
                      })
                    }
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-4.26" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {dataFetched && <>

            {/* Client Information */}
            <Card
              title="Info Client"
              subtitle={`Période du ${startDate} au ${endDate}`}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="info-grid">
                  <div className="info-item"><div className="ik">Client</div><div className="iv plain" id="c-name">{clientInfo?.nom}</div></div>
                  <div className="info-item"><div className="ik">N° WhatsApp</div><div className="iv">{clientInfo?.numtel}</div></div>
                  <div className="info-item"><div className="ik">N° Compte</div><div className="iv">{clientInfo?.numcompte}</div></div>
                  <div className="info-item"><div className="ik">Statut</div><div className="iv"><span className="badge b-green">Actif</span></div></div>
                  <div className="info-item"><div className="ik">Niveau Palier</div><div className="iv"><span className="badge b-blue">Palier {palier}</span></div></div>
                  <div className="info-item"><div className="ik">Période</div><div className="iv plain" id="c-period">{startDate} → {endDate}</div></div>
                </div>
              </div>
            </Card>
          {/* Parametres Financiers */}
            <Card
              title="Paramètres Financiers"
              subtitle="Chiffre d'affaires HT, TVA et TTC"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="params-bar">
                  <div className="param-box"><div className="pk">CA HT</div><div className="pv">{systemParams && totalSales? insertCharacter(Math.round(((totalSales.totalvente*100) / (systemParams.tva + 100))).toString()):"N/A"}<span style={{fontSize:'.75rem',opacity:'.65'}}> FCFA</span></div><div className="psub">Hors Taxes</div></div>
                  <div className="param-box"><div className="pk">TVA ({systemParams?.tva} %)</div><div className="pv">{systemParams && totalSales? insertCharacter(Math.round((systemParams.tva *  ((totalSales.totalvente*100) / (systemParams.tva + 100)))/100).toString()):"N/A"}<span style={{fontSize:'.75rem',opacity:'.65'}}> FCFA</span></div><div className="psub">Taxe sur la valeur ajoutée</div></div>
                  <div className="param-box highlight"><div className="pk">CA TTC</div><div className="pv">{insertCharacter((totalSales?.totalvente ?? '0').toString())}<span style={{fontSize:'.85rem',opacity:'.65'}}> FCFA</span></div><div className="psub">Montant total toutes taxes</div></div>
                </div>
              </div>
            </Card>
          {/* Achats et PV Correspondants */}
            <Card
              title="Achats et PV Correspondants"
              subtitle="Achats personnels du client sur la période"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th >Libellé</th>
                        <th className="r">Qté</th>
                        <th className="r">PV au Colis</th>
                        <th className="r">Total PV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articlesSold?.map((article,index)=>(
                        <tr key={index}>
                          <td>{article.libelle}</td>
                          <td className="r"><span className="qty-tag">{article.qte}</span></td>
                          <td className="r">{article.points}</td>
                          <td className="r">{article.points * article.qte}</td>
                      </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Totaux</td>
                        <td className="r">{articlesSold?.reduce((acc,article)=> acc + article.qte,0)}</td>
                        <td className="r">/</td>
                        <td className="r">{articlesSold?.reduce((acc,article)=> acc + (article.qte * article.points),0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Card>
            {/* Achats et PV Correspondants */}
            <Card
              title="Abonnement et/ou Parrainage(s) effectué(s)"
              subtitle={`${downlineSubs} parrainages enregistrés sur la période`}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="tw">
                  <table className="parr-table">
                    <thead><tr><th>Code Client</th><th>Nom et Prénoms</th><th>N° Tél</th><th>Date Abonnement</th></tr></thead>
                    <tbody>
                      {clientSubscriptions?.length > 0 ? (
                          clientSubscriptions.map((client, index) => (
                            <tr key={index}>
                              <td className="b" style={{fontFamily:'var(--font-mono)',fontSize:'.78rem'}}>{client.id_client}</td>
                              <td>{client.nom}</td>
                              <td style={{fontFamily:'var(--font-mono)'}}>{client.numtel}</td>
                              <td>{printDate(client.d_creation)}</td>
                            </tr>
                          ))
                          ) : (
                            <tr>
                              <td className="px-4 py-2 text-sm" colSpan={4}>N/A</td>
                            </tr>
                          )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="lbl" colSpan={2}>Nombre d&#39;abonnement(s) : <strong>{clientSubscriptions?.length}</strong></td>
                        <td className="lbl r" colSpan={2}>PV abonnement : <strong>{clientSubscriptions?.length * 35}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Card>
          {/* SECTION: DOWNLINES */}
            <Card
              title="Achats et PV Correspondants des Downlines"
              subtitle="Noms et prenoms du Client Downline suivis de ces achats"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="6" height="4" rx="1"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <rect x="5" y="17" width="6" height="4" rx="1"/>
                  <rect x="13" y="17" width="6" height="4" rx="1"/>
                  <path d="M5 7v4h6m0 0v2m0-2h6V7M11 11v2"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="dl-wrap">
                  {downlinePurchases?.map((pc,index) =>(
                      <DownlineAccordion
                        key={index}
                        name={pc.nom}
                        code={pc.client}
                        totalPv={pc.purchases.reduce((acc,purchase)=>acc+(purchase.qte*purchase.points),0)}
                        totalQuantity={pc.purchases.reduce((acc,purchase)=>acc+purchase.qte,0)}
                        defaultOpen={true}
                        purchases={pc.purchases}
                      />
                    ))}
                </div>
              </div>
            </Card>
            {/* SECTION: CALCUL RISTOURNE */}
            <Card
              title="Calcul de la Ristourne Correspondante"
              subtitle={`Total PV :
                          ${articlesSold && downlinePurchases &&clientSubscriptions?insertCharacter((downlinePurchases.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) + (clientSubscriptions.length * 35) + articlesSold.reduce((acc,article)=> acc + (article.qte * article.points),0)).toString()):"NA"}
                          — Palier ${palier}
                          — Parrainage : ${systemParams
                    ?insertCharacter((downlineSubs * Number(systemParams.valabonnement ?? 0)).toString())
                    :"NA"} FCFA`}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              }
            >
              <div className="card-body collapse open">
                {/* PV + Parrainage summary */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.875rem',marginBottom:'1.25rem'}} className="params-bar">
                  <div className="param-box"><div className="pk">Prime Parrainage</div><div className="pv">{insertCharacter((downlinePurchases?.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) ?? '0').toString())}<span style={{fontSize:'.72rem',opacity:'.65'}}> FCFA</span></div><div className="psub">Inclus dans la ristourne</div></div>
                  <div className="param-box"><div className="pk">Parrainages Downlines</div><div className="pv">{systemParams
                    ?insertCharacter((downlineSubs * Number(systemParams.valabonnement ?? 0)).toString())
                    :"NA"}<span style={{fontSize:'.72rem',opacity:'.65'}}> FCFA</span></div><div className="psub">{downlineSubs}</div></div>
                  <div className="param-box"><div className="pk">Total des PV</div><div className="pv">{articlesSold && downlinePurchases &&clientSubscriptions?insertCharacter((downlinePurchases.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) + (clientSubscriptions.length * 35) + articlesSold.reduce((acc,article)=> acc + (article.qte * article.points),0)).toString()):"NA"}</div><div className="psub">Palier : <strong>{palier}</strong></div></div>
                </div>
                {/* Ristourne detail table */}
                <div className="tw">
                  <table className="rist-detail">
                    <thead>
                      <tr>
                        <th>Libellé Produit</th>
                        <th className="r">Qté</th>
                        <th className="r">Valeur Unitaire (FCFA)</th>
                        <th className="r">Valeur Totale (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.map((d,i)=>( <tr key={i}>
                          <td className="b">{d.libelle}</td>
                          <td className="r"><span className="qty-tag">{d.ttqtesortie}</span></td>
                          <td className="r">{insertCharacter(d.valpvar.toString())}</td>
                          <td className="r">{insertCharacter(d.valar.toString())}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr><td className="lbl">Sous Total Achats</td><td colSpan={2}></td><td className="r">{insertCharacter((details?.reduce((acc,dv)=>acc+Number(dv.valar),0) ?? 0).toString())}</td></tr>
                      <tr className="total-row">
                        <td className="lbl" colSpan={3} style={{fontSize:'.9rem',fontWeight:'700',letterSpacing:'.04em'}}>MONTANT RISTOURNE</td>
                        <td className="r" style={{fontSize:'1rem',fontWeight:'800',fontFamily:'var(--font-mono)'}}>{details && systemParams && clientInfo? insertCharacter((
                          (details.reduce((acc,dv)=>acc+Number(dv.valar),0)) +
                          (downlineSubs * Number(systemParams.valabonnement ?? 0) +
                          +((clientInfo.d_creation >= startDate && clientInfo.d_creation <= endDate) ? systemParams.valabonnementpropre:0))
                        ).toString()):'NA'} F CFA</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Card>
          {/* SECTION: RISTOURNE FINALE */}
            <div className="card" style={{overflow:'visible'}}>
              <div className="card-body" style={{padding:'0'}}>
                <div className="rist-final">
                  <div className="rist-left">
                    <div className="rist-lbl">Montant Ristourne Total</div>
                    <div className="rist-amount">{details && systemParams && clientInfo? insertCharacter((
                      (details.reduce((acc,dv)=>acc+Number(dv.valar),0)) +
                      (downlineSubs * Number(systemParams.valabonnement ?? 0) +
                      +((clientInfo.d_creation >= startDate && clientInfo.d_creation <= endDate) ? systemParams.valabonnementpropre:0))
                    ).toString()):'NA'}<span className="rist-cur">F CFA</span></div>
                    <div className="rist-meta">{clientInfo?.nom} &bull; {clientInfo?.numtel} &bull; Période : {startDate} → {endDate}</div>
                  </div>
                  <div className="rist-badges">
                    <div className="rist-badge"><div className="rb-lbl">Total PV</div><div className="rb-val">{articlesSold && downlinePurchases &&clientSubscriptions?insertCharacter((downlinePurchases.reduce((acc,dn)=>acc+(dn.purchases.reduce((a,p)=>a+(p.qte*p.points),0)),0) + (clientSubscriptions.length * 35) + articlesSold.reduce((acc,article)=> acc + (article.qte * article.points),0)).toString()):"NA"}</div></div>
                    <div className="rist-badge"><div className="rb-lbl">Palier</div><div className="rb-val">{palier}</div></div>
                    <div className="rist-badge"><div className="rb-lbl">Parrainages</div><div className="rb-val">{downlineSubs}</div></div>
                    <div className="rist-badge"><div className="rb-lbl">Downlines</div><div className="rb-val">{downlinePurchases?.length}</div></div>
                  </div>
                </div>
              </div>
            </div>
          {/* ACTIONS */}
            <div className="card actions-card no-print">
              <div className="card-body">
                <div className="actions-bar">
                  <span className="ts">Rapport généré le <strong id="gen-date">{d.toLocaleDateString("fr-Fr")}</strong> &mdash; {clientInfo?.nom}</span>
                  <button className="btn btn-print" onClick={() => {printMiddleware('PRINT',setPrintLoadPdf)}}>
                    {!printLoadPdf && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
                    {printLoadPdf && <div className='spinner'></div>}
                    Imprimer
                  </button>
                  <button className="btn btn-pdf" onClick={() => {printMiddleware('DOWNLOAD',setLoadingPdf)}}>
                    {!loadingPdf && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                    {loadingPdf && <div className='spinner'></div>}
                    Export PDF
                  </button>
                  <button className="btn btn-excel" onClick={() => {}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          </>}
          {!dataFetched && (<>
              {/* PLACEHOLDER */}
              <div className="card">
                <div className="placeholder">
                  <div className="ph-icon">📋</div>
                  <div className="ph-title">Aucun rapport chargé</div>
                  <div className="ph-text">Sélectionnez un client et une période, puis cliquez sur <strong>Rechercher</strong>.</div>
                </div>
              </div>
            </>)
          }
        </main>
      </div>
    </>
  );
}