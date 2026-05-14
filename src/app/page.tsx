"use client";
import {useState,useEffect,useCallback} from 'react';
import { useRouter } from "next/navigation";
import {useToken} from "@/context/TokenContext";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from 'react-hot-toast';

type LoginForm = {
  name:string
  password:string
}

export default function LoginPage() {
  const r = useRouter();
  const { setToken } = useToken();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setLoading(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token",result.token)
        setToken(true);
        r.replace('/consultation');
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
  }

  const innit = useCallback(() =>{
    const token = localStorage.getItem("token");
    console.log(token)
    if (token){
      r.replace("/consultation");
    }
  },[r])

  useEffect(() => {
    innit()
  },[innit])

  return (
    <div id="login-page">
      <form className="login-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="login-logo">
          <div className="login-logo-icon">R</div>
            <div className="login-logo-text">
              <strong>Gesbout</strong>
              <span>Dashboard Pro</span>
            </div>
        </div>

        <div className="login-title">Connexion</div>
          <div className="login-subtitle">
            Accédez à votre espace de gestion des ristournes
          </div>

          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              className="form-input"
              {...register("name", { required: "Le login est obligatoire" })}
            />
            {errors.name && (
              <small className="error-message">
                {errors.name.message}
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              {...register("password", { required: "Le mot de passe est obligatoire" })}
            />
            {errors.password && (
              <small className="error-message">
                {errors.password.message}
              </small>
            )}
          </div>
          <div className="login-forgot"><a href="#">Mot de passe oublié ?</a></div>

          <button
            className={`btn btn-primary btn-full`}
            type='submit'
            disabled={loading}
          >
            {loading && <div className='spinner'></div>}
            {loading?'Chargement...':'Se connecter'}
          </button>
          <div className="login-footer">
            Version 2.0.1 &mdash; © 2026 Gesbout Dashboard
          </div>
      </form>
    </div>
  );
}