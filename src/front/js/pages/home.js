import "../../styles/home.css";
import React, { useEffect, useContext, useState } from "react";
import { Welcome } from '../component/home-carrousel'
import { Onfire } from '../component/onfire'
import { HomeCatalog } from "../component/home-catalog";
import { Context } from "../store/appContext";
import { privateUser } from "../apiservices/callToApi";
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";


export const Home = () => {
	const { actions } = useContext(Context);
	const [isVerified, setIsVerified] = useState(null)
	const navigate = useNavigate()
	const check = async() =>{
		const verified = await privateUser();
		setIsVerified(verified)
		
	}

	
	
	useEffect(() => {
		actions.setPositiveColors();
		actions.setNavbarVisibility();
	
	}, []);

	useEffect(()=>{
		check()
	})


	useEffect(() => {
		if(isVerified != true && isVerified != null){
			Swal.fire({
				title: "Bienvenido/a!",
				text: "Para poder agregar productos a tu carrito es necesario que hayas iniciado sesión.",
				showDenyButton: true,
				confirmButtonText: "Iniciar sesión",
				denyButtonColor: "#304250cc",
				denyButtonText: "Crear usuario",
				confirmButtonColor: "#77bcc7",
				
			  }).then((result) => {
				if (result.isConfirmed) {
				  navigate("/login")
				}
				else if(result.isDenied){
					navigate("/signup")
				}
			  });
		}				
		
	  }, [isVerified])

	return (
		<div className="page-content" style={{ backgroundColor: "rgb(47, 65, 79)" }}>
			<Welcome />
			<div className="container mx-auto py-4">
				<Onfire type1="tvs" id1="8" type2="laptops" id2="2" />
				<HomeCatalog />
			</div>
			<div class="modal" tabindex="-1">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Modal title</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body">
							<p>Modal body text goes here.</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary">Save changes</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
