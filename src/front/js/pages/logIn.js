import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../apiservices/callToApi";
import { Context } from "../store/appContext";

export const LogIn = () => {
    const [user, setUser] = useState({});
    const [responseApi, setResponseApi] = useState({});
    const navigate = useNavigate();
    const { actions } = useContext(Context);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        login(user, setResponseApi, navigate);
    };

    const handlePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useEffect(() => {
        actions.setPositiveColors();
        actions.setNoneNavbarVisibility();
    }, []);

    return (
        <>
            <div className="container-fluid d-flex justify-content-center align-items-center mb-5" style={{ backgroundColor: "rgb(47, 65, 79)", width: "30em" }}>
                <div className="row md-col-12">
                    <div className="d-flex justify-content-center mt-5">
                        <Link to="/">
                            <img src="https://i.postimg.cc/ryxpY9LS/imagotipo-naranja.png" style={{ height: "50px" }} />
                        </Link>
                    </div>
                    <h1 className="text-white titulo mt-3 text-center title-login">Iniciar sesión</h1>
                    <form className="border border-light rounded-3 mb-5 px-3" onSubmit={handleSubmit}>
                        
                        <div className={`${responseApi.msg ? "opacity-100": "opacity-0"} mt-3 mb-0 d-flex justify-content-center rounded my-0`}>
                            <h5 className="py-0 bg-white text-danger rounded p-2">
                        <i class="fa-solid fa-triangle-exclamation"></i>  Contraseña o Email incorrecto
                        </h5>
                        </div>
                       

                    
                        <div className="texto">
                            <label htmlFor="email" className="form-label text-white">Email</label>
                            <input type="text" className="form-control" name="email" onChange={handleChange} autoComplete="email" placeholder="example@gmail.com" />
                        </div>
                        <div className="texto">
                            <label htmlFor="password" className="form-label text-white mt-4">Contraseña</label>
                            <div className="password-container">
                                <input type={isPasswordVisible ? "text" : "password"} className="form-control" name="password" onChange={handleChange}  placeholder="example123" />
                                <i className={`fa-solid ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} onClick={handlePasswordVisibility}></i>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <span className="text-white mt-4 texto">¿No tienes una cuenta?</span> <span><Link to={'/signup'}><span style={{ color: 'rgb(102, 252, 241)' }}>Crear usuario</span></Link></span>
                        </div>
                        <button type="submit" className="btn button-submit mt-5 mb-4 text-white texto">Continuar</button>
                    </form>
                </div>
            </div>
        </>
    );
};
