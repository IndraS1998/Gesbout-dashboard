'use client';

import { useState,useEffect,useCallback } from "react";
import {useRouter} from "next/navigation";
import toast from 'react-hot-toast';
import styles from "./page.module.css";
import LoadingOverlay from "@/components/loadingOverlay/component";
import Card from "@/components/card/components";
import { useForm } from "react-hook-form";
import Nav from "@/components/nav/component";
import {Client} from "@/context/types";
import {formatDate} from "@/context/utilityFunctions";

type FilterForm = {
  client: Client;
};

export default function ChildList() {
  const [loading,setLoading] = useState(false);
  const [clients,setClients] = useState<Client[]>([]);
  const [sponsor,setSponsor] = useState<Client | null>(null);
  const [children,setChildren] = useState<Client[]>([]);
  const r = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterForm>({
    defaultValues: {
      client: {},
    },
  });

  const fetchClients = useCallback(async () => {
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
    fetchClients();
  }, [fetchClients]);

  const onSubmit = async (data: FilterForm) => {
    console.log(data);
    setLoading(true);
    try {
      const response = await fetch("/api/protected/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setSponsor(result.data.sponsor);
        setChildren(result.data.children);
      } else {
        if(response.status == 500){
          toast.error("Connexion impossible, Vérifiez votre connexion internet puis réessayez ❌")
        }else{
          toast.error("Erreur de connexion ❌");
        }
      }
    } catch (error) {
      toast.error("Connexion impossible. Vérifiez votre connexion internet puis réessayez ❌");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay show={loading} />

      <div className={styles.page}>
        <Nav />

        <main className={styles.main}>
          {/* SEARCH SECTION */}
          <Card
            title="Recherche du Parrain"
            subtitle="Sélectionnez un client afin de consulter ses filleuls directs"
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
                    {...register("client", {
                      required:
                        "Veuillez sélectionner un client",
                    })}
                  >
                    <option value="">
                      Sélectionner un client
                    </option>

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
                        client: {},
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
              {errors.client && (
                <span
                  style={{
                    color: "#d92d20",
                    fontSize: ".75rem",
                    marginTop: ".1rem",
                  }}
                >
                  {errors.client.message}
                </span>
              )}
            </form>
          </Card>

          {sponsor && (<>
            {/* SPONSOR INFORMATION */}
            <Card
              title="Informations du Parrain"
              subtitle="Détails du client sélectionné"
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="ik">ID Client</div>
                    <div className="iv">{sponsor?.id_client}</div>
                  </div>

                  <div className="info-item">
                    <div className="ik">Nom Complet</div>
                    <div className="iv plain">
                      {sponsor?.nom}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="ik">Téléphone</div>
                    <div className="iv">
                      {sponsor?.numtel}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="ik">
                      Date Inscription
                    </div>
                    <div className="iv">
                      {formatDate(sponsor?.d_creation)}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="ik">
                      Nombre de Filleuls
                    </div>
                    <div className="iv">
                      <span className="badge b-blue">
                        {children.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* CHILDREN TABLE */}
            <Card
              title="Liste des Filleuls"
              subtitle={`${children.length} filleul(s) direct(s) enregistré(s)`}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            >
              <div className="card-body collapse open">
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Code Client</th>
                        <th>Nom et Prénoms</th>
                        <th>Téléphone</th>
                        <th>Date Inscription</th>
                        <th>Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {children.map((child) => (
                        <tr key={child.id_client}>
                          <td
                            style={{
                              fontFamily:
                                "var(--font-mono)",
                            }}
                          >
                            {child.id_client}
                          </td>

                          <td>{child.nom}</td>

                          <td
                            style={{
                              fontFamily:
                                "var(--font-mono)",
                            }}
                          >
                            {child.numtel}
                          </td>

                          <td>
                            {formatDate(child.d_creation)}
                          </td>

                          <td>
                            <span
                              className={
                                child.statut ===
                                "Actif"
                                ? "badge b-green"
                                : "badge b-red"
                              }
                            >
                              {child.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td
                          className="lbl"
                          colSpan={4}
                        >
                          Total des filleuls
                        </td>

                        <td>
                          <strong>
                            {children.length}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Card>
          </>)}
          {!sponsor && (<>
              {/* PLACEHOLDER */}
              <div className="card">
                <div className="placeholder">
                  <div className="ph-icon">📋</div>
                  <div className="ph-title">Aucun client chargé</div>
                  <div className="ph-text">Sélectionnez un client puis cliquez sur <strong>Rechercher</strong>.</div>
                </div>
              </div>
            </>)
          }
        </main>
      </div>
    </>
  );
}