'use client';

import { useState } from "react";
import styles from "./page.module.css";
import LoadingOverlay from "@/components/loadingOverlay/component";
import Card from "@/components/card/components";
import { useForm } from "react-hook-form";
import Nav from "@/components/nav/component";

type FilterForm = {
  client: string;
};

type Sponsor = {
  code: string;
  nom: string;
  telephone: string;
  dateCreation: string;
  totalChildren: number;
};

type Child = {
  code: string;
  nom: string;
  telephone: string;
  dateInscription: string;
  statut: string;
};

const sponsors: Sponsor[] = [
  {
    code: "CL000123",
    nom: "Jean Pierre Mbarga",
    telephone: "699001122",
    dateCreation: "2025-03-14",
    totalChildren: 4,
  },
  {
    code: "CL000124",
    nom: "Paul Messi",
    telephone: "677112244",
    dateCreation: "2025-04-10",
    totalChildren: 2,
  },
];

const sponsor: Sponsor = sponsors[0];

const children: Child[] = [
  {
    code: "CL000201",
    nom: "Marie Ndzi",
    telephone: "677112233",
    dateInscription: "2025-04-01",
    statut: "Actif",
  },
  {
    code: "CL000202",
    nom: "Paul Messi",
    telephone: "695443322",
    dateInscription: "2025-04-03",
    statut: "Actif",
  },
  {
    code: "CL000203",
    nom: "Sandrine Foko",
    telephone: "651223344",
    dateInscription: "2025-04-09",
    statut: "Inactif",
  },
];

export default function ChildList() {
  const [loading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterForm>({
    defaultValues: {
      client: "",
    },
  });

  const onSubmit = async (data: FilterForm) => {
    console.log("Selected Client:", data.client);
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

                    {sponsors.map((client) => (
                      <option
                        key={client.code}
                        value={client.code}
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
                        client: "",
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
                  <div className="ik">Code Client</div>
                  <div className="iv">{sponsor.code}</div>
                </div>

                <div className="info-item">
                  <div className="ik">Nom Complet</div>
                  <div className="iv plain">
                    {sponsor.nom}
                  </div>
                </div>

                <div className="info-item">
                  <div className="ik">Téléphone</div>
                  <div className="iv">
                    {sponsor.telephone}
                  </div>
                </div>

                <div className="info-item">
                  <div className="ik">
                    Date Inscription
                  </div>
                  <div className="iv">
                    {sponsor.dateCreation}
                  </div>
                </div>

                <div className="info-item">
                  <div className="ik">
                    Nombre de Filleuls
                  </div>
                  <div className="iv">
                    <span className="badge b-blue">
                      {sponsor.totalChildren}
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
                      <tr key={child.code}>
                        <td
                          style={{
                            fontFamily:
                              "var(--font-mono)",
                          }}
                        >
                          {child.code}
                        </td>

                        <td>{child.nom}</td>

                        <td
                          style={{
                            fontFamily:
                              "var(--font-mono)",
                          }}
                        >
                          {child.telephone}
                        </td>

                        <td>
                          {child.dateInscription}
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
        </main>
      </div>
    </>
  );
}