import React from 'react';

export type Client = {
    id_client: string;
    email: string;
    nom: string;
    d_creation: string;
    numtel: string;
    numcompte: string;
}

export type Params = {
    id_parametre: string;
    exercice: string;
    tva: number;
    air: string;
    valabonnement: string;
    pvabonnement: string;
    pvabonnementpropre: string;
    valabonnementpropre: string;
}

export type TotalSales = {
    totalvente: number;
}

export type Article = {
    libelle: string;
    qte: number;
    points: number;
}

export type Purchase = {
    libelle: string;
    points: number;
    qte: number;
    id_article: string;
}

export type PurchaseWithClient = {
    client:string;
    nom:string;
    purchases:Purchase[];
}

export type DetailPerAr = {
    libelle: string;
    ttqtesortie: string;
    valpvar: string;
    valar: string;
}

export type BoolSetter = React.Dispatch<React.SetStateAction<boolean>>;