import React, { useEffect, useState, useContext } from "react";
import { createUser, getUsers } from "../apiservices/callToApi";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const SignUp = () => {
    const [newUser, setNewUser] = useState({});
    const [password, setPassword] = useState(true);
    const [userList, setUserList] = useState([]);
    const [userExist, setUserExist] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const { actions } = useContext(Context);

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newUser) {
            if (newUser.password !== newUser.confirmPassword) {
                return;
            } else {
                createUser(newUser, navigate);
            }
        }
    };

    const handlePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    useEffect(() => {
        if (newUser) {
            if (newUser.password && newUser.confirmPassword) {
                if (newUser.password !== newUser.confirmPassword) {
                    setPassword(false);
                } else {
                    setPassword(true);
                }
            } else {
                setPassword(true);
            }

            if (newUser.email || newUser.username) {
                if (userList) {
                    if (userList.includes(newUser.email) || userList.includes(newUser.username)) {
                        setUserExist(true);
                    } else {
                        setUserExist(false);
                    }
                }
            }
        }
    }, [newUser]);

    const usersApi = async () => {
        const users = await getUsers();
        users.forEach(user => {
            setUserList(prevList => [...prevList, user.username, user.email]);
        });
    };

    useEffect(() => {
        usersApi();
        actions.setPositiveColors();
        actions.setNoneNavbarVisibility();
    }, []);

    return (
        <>
            <div className="container-fluid d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgb(47, 65, 79)", width:"30em" }}>
                <div className="row md-col-12 form-signup">
                    <div className="d-flex justify-content-center mt-5">
                        <Link to="/">
                            <img src="https://i.postimg.cc/ryxpY9LS/imagotipo-naranja.png" style={{ height: "50px" }} />
                        </Link>
                    </div>
                    <h1 className="text-white titulo text-center title-signup mt-2">Crear usuario</h1>
                    <form className="border border-light rounded-3 px-4" onSubmit={handleSubmit}>
                        <div className="texto">
                        
                                 <div className={`${userExist ? "opacity-100" : "opacity-0"} d-flex justify-content-start text-danger mt-2`}>
                             <span className="bg-white p-1 rounded"><i class="fa-solid fa-triangle-exclamation"></i> Ya existe una cuenta asociada a este <b>Email</b> o <b>Usuario</b>.</span></div>
                            <div className="d-flex">
                               
                            
                            <label htmlFor="username" className="form-label text-white mt-2">Nombre de Usuario</label>
                        
</div>
                            <input type="text" className="form-control" onChange={handleChange} name="username" autoComplete="username" required placeholder="Nombre de Usuario" />
                        </div>
                        <div className="texto">
                            <label htmlFor="email" className="form-label text-white mt-2">Correo Electrónico</label>
                            <input type="email" className="form-control" onChange={handleChange} name="email" autoComplete="email" required aria-describedby="emailHelp" placeholder="example@gmail.com" />
                        </div>
                        <div className="texto">
                            <label htmlFor="password" className="form-label text-white mt-2">Contraseña</label>
                            <div className="password-container">
                                <input type={isPasswordVisible ? "text" : "password"} className="form-control" onChange={handleChange} name="password" placeholder="Example123"/>
                                <i className={`fa-solid ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} onClick={handlePasswordVisibility}></i>
                            </div>
                        </div>
                        <div className="texto">
                            <label htmlFor="confirmPassword" className="form-label text-white mt-2">Confirmar Contraseña</label>
                            <div className="password-container">
                                <input type={isConfirmPasswordVisible ? "text" : "password"} className="form-control" onChange={handleChange} name="confirmPassword" placeholder="Example123"/>
                                <i className={`fa-solid ${isConfirmPasswordVisible ? "fa-eye-slash" : "fa-eye"}`} onClick={handleConfirmPasswordVisibility}></i>
                            </div>
                            {/* {!password &&  */}
                             <div className={`${!password ? "opacity-100": "opacity-0"}  d-flex justify-content-start rounded my-0`}>                       <h5 className="py-0 mt-3 bg-white text-danger rounded p-2">
                             <i class="fa-solid fa-triangle-exclamation"></i>
                             Las contraseñas no coinciden
                             </h5>
                             </div>
                                {/* } */}
                        </div>
                        <div className="toLogin" style={{ margin: '2em' }}>
                            <span className="text-white mt-4 texto">¿Ya estás registrado?</span>
                            <span><Link to={'/login'}><span style={{ color: 'rgb(102, 252, 241)', paddingLeft: '5px' }}>Iniciar sesión</span></Link></span>
                        </div>
                        <button type="submit" className="btn button-submit mb-4 text-white texto">Continuar</button>
                    </form>
                </div>
            </div>
        </>
    );
};
