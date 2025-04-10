import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { privateUser } from "../apiservices/callToApi";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const [isVerified, setIsVerified] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const infoUser = store.infoUser;

  let products = [];
  const phones = store.phones;
  const tvs = store.tvs;
  const laptops = store.laptops;
  products = [...phones, ...tvs, ...laptops];

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results =
    search.length > 0 &&
    products.filter(({ modelo = "", marca = "" }) =>
      modelo.toLowerCase().includes(search.toLowerCase()) ||
      marca.toLowerCase().includes(search.toLowerCase())
    );

  const validacionProduct = (product) => {
    let route = "";
    if (product.laptop_id) {
      route = `/laptop-info/${product.laptop_id}`;
    } else if (product.smartphone_id) {
      route = `/smartphone-info/${product.smartphone_id}`;
    } else if (product.tv_id) {
      route = `/tv-info/${product.tv_id}`;
    }
    navigate(route);
    setSearch("");
  };

  const checkout = async () => {
    const verified = await privateUser();
    setIsVerified(verified);
  };

  useEffect(() => {
    checkout();
  });

  useEffect(() => {
    if (isVerified) {
      actions.userIndividual();
    }
  }, [isVerified]);

  const logOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("idUser");
    checkout();
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        store.negative_colors ? "negative-navbar" : "positive-navbar"
      }`}
      style={store.navbar_visibility ? { display: "block" } : { display: "none" }}
    >
      <div className="container">
        <Link to={"/"}>
          <img
            className="navbar-brand logo-navbar"
            src="https://i.postimg.cc/ryxpY9LS/imagotipo-naranja.png"
            style={{ height: "5rem" }}
            alt="Brand Logo"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse d-flex justify-content-between" id="navbarSupportedContent">
          <div className="d-flex justify-content-end flex-grow-1">
            <form className="dropdown-search" role="search">
              <ul>
                <input
                  className={`p-1 me-2 ${search.length !== 0 ? "input-search-focus" : "input-search"}`}
                  value={search}
                  onChange={(e) => searcher(e)}
                  type="search"
                  placeholder="Buscar"
                  aria-label="Search"
                />
                {search.length !== 0 && (
                  <div className="dropdown-content-search d-block w-100">
                    {results.map((product, index) => (
                      <p key={index} onClick={() => validacionProduct(product)}>
                        {product.marca} {product.modelo}
                      </p>
                    ))}
                  </div>
                )}
              </ul>
            </form>
          </div>
          <ul className="navbar-nav ms-auto mb-0">
            <li className="nav-item">
              <Link to="/phones-catalog">
                <p className="nav-link" style={{ color: "white" }} aria-current="page">
                  Móviles
                </p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/tvs-catalog">
                <p className="nav-link" style={{ color: "white" }} aria-current="page">
                  Televisores
                </p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/laptops-catalog">
                <p className="nav-link" style={{ color: "white" }} aria-current="page">
                  Pórtatiles
                </p>
              </Link>
            </li>
            <li className="nav-item">
              <a href="#footer" className="nav-link" style={{ color: "white" }}>
                Contacto
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropbtn move-icon-navbar" style={{ color: "white" }}>
                <i className="fa-solid fa-user"></i>
              </a>
              {!isVerified ? (
                <div className={`dropdown-content ${store.negative_colors ? "negative-login" : "positive-login"}`}>
                  <br />
                  <Link to={"/login"}>
                    <span>Iniciar sesión</span>
                  </Link>
                  <hr />
                  <Link to={"/signup"}>
                    <span>Crear usuario</span>
                  </Link>
                  <br />
                </div>
              ) : (
                <div className={`dropdown-content ${store.negative_colors ? "negative-login" : "positive-login"}`}>
                  <div className="container-photo">
                    <img className="photo-navbar-user" src={infoUser.image} alt="user" />
                    <p>Hola, {infoUser.username}</p>
                  </div>
                  <Link to={"/personalzone"}>
                    <span>Zona Personal</span>
                  </Link>
                  <hr />
                  <Link to={"/"}>
                    <span onClick={logOut}>Cerrar Sesión</span>
                  </Link>
                  <br />
                </div>
              )}
            </li>
            <li className="nav-item">
              <Link to="/cart" onClick={window.location.reload}>
                <p className="nav-link move-icon-navbar" style={{ color: "white" }}>
                  <i className="fa-solid fa-cart-shopping"></i>
                </p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
