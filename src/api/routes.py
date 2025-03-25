"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Smartphones, TVs, Laptops, Pedido
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import json
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.productos.phones import phones
from api.productos.tv import tvs
from api.productos.laptops import laptops
import cloudinary
import cloudinary.uploader
import stripe



api = Blueprint('api', __name__)
stripe.api_key = "sk_test_51QxWTcF1M5ixil84JujDUVjcNbDMjk8CpG3Akk0Bq1rlK7Ur5mVJkxZGUOJN78FO40hzxIiHJFMbfD4FKVhMrXJq00Q45N3TjR"

# Allow CORS requests to this API
CORS(api)

#ENDPOINT PASARELA DE PAGO STRIPE
@api.route('/payment', methods=['POST'])
def create_payment():
    try:
        data = request.json
        intent = stripe.PaymentIntent.create(
            amount=data['amount'],
            currency= data['currency'],
            automatic_payment_methods = {'enabled': True})
        return jsonify({'client_secret': intent['client_secret']}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

#ENDPOINT IMAGEN CLOUDINARY
@api.route('/upload-image', methods=['POST'])
def upload():
    file_to_upload = request.files['img']
    if file_to_upload:
        upload = cloudinary.uploader.upload(file_to_upload)
        print(upload['url'])
        return jsonify(upload['secure_url']), 201
    return jsonify({'error': 'no se cargo la imagen'}), 400
    

#ENDPOINTS USERS

@api.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 201

@api.route('/user-signup', methods=['POST'])
def post_users():
    data = request.get_json()
    exist = User.query.filter_by(username=data['username']).first()
    if exist:
        return jsonify({"msg": "Este usuario ya existe"}), 400
    email = request.json.get('email')
    password = request.json.get('password')
    username = request.json.get('username')

    if not email or  not password or not username:
        return jsonify({"msg" :  "Faltan datos"}), 400

    new_user = User(
        name = data['name'],
        lastname = data['lastname'],
        email = data['email'],
        password = data['password'],
        username = data['username'],
        address = data['address'],
        birthday_date = data['birthday_date'],
        user_image = data['image'],
        is_active = True,
        is_admin = False,
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Usuario Agregado"}), 201

@api.route('/login', methods=["POST"])
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user is None:
        return jsonify({'msg': "Contraseña o Email incorrecto"}), 400

    access_token = create_access_token(identity=str(user.user_id))
    return jsonify({'token': access_token, 'user' : user.serialize()}), 201

@api.route('/private', methods=['GET'])
@jwt_required()
def verify():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    return jsonify({'msg': 'area privida','id': user.user_id, 'username': user.username}), 201

@api.route('/users/<int:id_user>', methods=['DELETE'])
def delete_users(id_user):
    exist = User.query.filter_by(user_id=id_user).first()
    if exist:
        db.session.delete(exist)
        db.session.commit()
        return jsonify({"msg": "User deleted from data base"}), 201
    return jsonify({"msg": "No User id was found"}), 400

@api.route('/update-user/<int:id_user>', methods=['PUT'])
def update_users(id_user):
    user = User.query.get(id_user)
    data = request.get_json()
   
    user.name = data['name']
    user.lastname = data['lastname']
    user.email = data['email']
    user.password = data['password']
    user.username = data['username']
    user.address = data['address']
    user.user_image = data['image']
    user.birthday_date = data['birthday_date']

    db.session.commit()
    return jsonify({'msg': f'actualizado {user.name}'}), 201

@api.route('/user/<int:id_user>', methods=['GET'])
def get_user_individual(id_user):
    user = User.query.get(id_user)

    return jsonify(user.serialize()), 201


#ENDPOINTS CARRITO

#ENDPOINT POST CREAR CARRITO

@api.route('/cart/<int:user_id>', methods=['POST'])
def add_cart(user_id):

    exist = Pedido.query.filter_by(user_id=user_id).first()

    if exist:
        return jsonify({"msg": "Tu carrito ya existe"}), 400
    elif not exist:
        new_cart_added = Pedido(user_id=user_id)
        db.session.add(new_cart_added)
        db.session.commit()
        return jsonify({"msg": "Carrito creado"}), 200

#ENDPOINT GET INFORMACION CARRITO

@api.route('cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):

    user = User.query.get(user_id)
    cart = Pedido.query.filter_by(user_id=user_id)

    data_cart = [cart.serialize() for cart in cart]
    return jsonify(data_cart), 200

#ENDPOINT DELETE INFORMACION CARRITO

@api.route('/cart/<int:user_id>', methods=['DELETE'])
def delete_cart(user_id):
    exist = Pedido.query.filter_by(user_id=user_id).first()

    if exist:
        db.session.delete(exist)
        db.session.commit()
        return jsonify({"msg": "Carrito eliminado"}), 200
    return jsonify({"msg": "Carrito no encontrado"})

#ENDPOINT AGREGAR PRODUCTOS AL CARRITO

@api.route('/cart/<int:user_id>/product/<string:product_type>/<int:product_id>/<int:active_color>', methods=['POST'])
def add_product_to_cart(user_id, product_type, product_id, active_color):

    cart = Pedido.query.filter_by(user_id=user_id).first()
    
    if cart:
    
        exist_item = None
        # if product_type == 'smartphone':
        #     new_item = Smartphones.query.get(product_id)
        # elif product_type == 'laptop':
        #     new_item = Laptops.query.get(product_id)
        # elif product_type == 'tv':
        #     new_item = TVs.query.get(product_id)

        # if not new_item:
        #     return {"msg": "Producto no encontrado"}, 404
        

        for item in cart.items:
            if item.product_id == product_id and item.tipo == product_type:
                exist_item = item
                break
        
        if exist_item:
            exist_item.quantity += 1
        else:
            new_item = cart
            db.session.add(new_item)
        db.session.commit()

        return jsonify({"msg" : "Agregado producto", "carrito": cart.items})



        # cart_filter = filter(lambda x: (x['product_id'] == product_id and x['tipo'] == product_type and x['active_color'] == active_color), cart.items)

        # if cart_filter:
            # for item in cart.items:
            #     if item['product_id'] == product_id and item['tipo'] == product_type:
            #         item['quantity'] = item['quantity'] + 1
            # print(cart_filter)
        # db.session.commit()
        # else:
        #     if product_type == "tv":
        #                 cart_items = {
        #                     "product_id": new_item.serialize()['tv_id'],
        #                     "nombre": new_item.serialize()['modelo'],
        #                     "precio": new_item.serialize()['precio'],
        #                     "descripcion": new_item.serialize()['descripcion'],
        #                     "imagen": new_item.serialize()['imagen'],
        #                     "tipo": new_item.serialize()['tipo'],
        #                     "active_color": 0,
        #                     "quantity" : 1,
        #                      }
        #     elif product_type == "smartphone":
        #                 cart_items = {
        #                     "product_id": new_item.serialize()['smartphone_id'],
        #                     "nombre": new_item.serialize()['modelo'],
        #                     "precio": new_item.serialize()['precio'],
        #                     "descripcion": new_item.serialize()['descripcion'],
        #                     "imagen": new_item.serialize()['imagen'],
        #                     "colores": new_item.serialize()['colores'],
        #                     "tipo": new_item.serialize()['tipo'],
        #                     "active_color": active_color,
        #                     "quantity" : 1
        #                  }
        #     elif product_type == "laptop":
        #                 cart_items = {
        #                     "product_id": new_item.serialize()['laptop_id'],
        #                     "nombre": new_item.serialize()['modelo'],
        #                     "precio": new_item.serialize()['precio'],
        #                     "descripcion": new_item.serialize()['descripcion'],
        #                     "imagen": new_item.serialize()['imagen'],
        #                     "colores": new_item.serialize()['colores'],
        #                     "tipo": new_item.serialize()['tipo'],
        #                     "active_color": active_color,
        #                     "quantity" : 1
        #                  }

    

        #     cart.items = cart.items + [cart_items]
        #     db.session.add(cart)
        #     db.session.commit()

   
  

        return {"msg": "Producto agregado al carrito", "carrito": cart.items}, 200
    

    # existing_smartphone = CartSmartphones.query.filter_by(pedido_id=cart.pedido_id, smartphone_id=product_id, active_color=active_color).first()
    # existing_tv = CartTvs.query.filter_by(pedido_id=cart.pedido_id, tv_id=product_id).first()
    # existing_laptop = CartLaptops.query.filter_by(pedido_id=cart.pedido_id, laptop_id=product_id, active_color=active_color).first()

    # if product_type == 'smartphone':
    #     if existing_smartphone:
    #         existing_smartphone.quantity+=1
    #         db.session.commit()
    #         return jsonify({"msg": "Producto agregado al carrito"}), 200
    #     else:
    #         add_product = CartSmartphones(pedido_id=cart.pedido_id, smartphone_id=product_id, active_color=active_color)

    # elif product_type == 'tv':
    #     if existing_tv:
    #         existing_tv.quantity+=1
    #         db.session.commit()
    #         return jsonify({"msg": "Producto agregado al carrito"}), 200
    #     else:
    #         add_product = CartTvs(pedido_id=cart.pedido_id, tv_id=product_id)
    # elif product_type == 'laptop':
    #     if existing_laptop:
    #         existing_laptop.quantity+=1
    #         db.session.commit()
    #         return jsonify({"msg": "Producto agregado al carrito"}), 200
    #     else:
    #         add_product = CartLaptops(pedido_id=cart.pedido_id, laptop_id=product_id, active_color=active_color)

    # db.session.add(add_product)
    # db.session.commit()

    # # return jsonify({"msg": "Producto agregado al carrito"}), 200

#ENDPOINT ELIMINAR PRODUCTOS DEL CARRITO

# @api.route('/cart/<int:user_id>/product/<string:product_type>/<int:cart_product_id>', methods=['DELETE'])
# def remove_product_from_cart(user_id, product_type, cart_product_id):

#     cart = Pedido.query.filter_by(user_id=user_id).first()

#     if product_type == 'smartphone':
#         product = CartSmartphones.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=cart_product_id).first()
#     elif product_type == 'tv':
#         product = CartTvs.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=cart_product_id).first()
#     elif product_type == 'laptop':
#         product = CartLaptops.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=cart_product_id).first()

#     if product:
#         db.session.delete(product)
#         db.session.commit()
#         return jsonify({"msg": "Producto eliminado del carrito"}), 200

#     return jsonify({"msg": "Producto no encontrado en el carrito"}), 400

#ENDPOINT MODIFICAR PRODUCTOS DEL CARRITO

# @api.route('/cart/<int:user_id>/product/<string:product_type>/<int:product_id>', methods=['PUT'])
# def modify_products_from_cart(user_id, product_type, product_id):

#     cart = Pedido.query.filter_by(user_id=user_id).first()

#     if product_type == 'smartphone':
#         product = CartSmartphones.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=product_id).first()

#     elif product_type == 'tv':
#         product = CartTvs.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=product_id).first()

#     elif product_type == 'laptop':
#         product = CartLaptops.query.filter_by(pedido_id=cart.pedido_id, cart_product_id=product_id).first()

#     else:
#         return jsonify({"msg": "Producto no encontrado"}), 400

#     if product:
#         new_quantity = request.json.get('quantity')
#         if new_quantity > 0:
#                 product.quantity = new_quantity
#                 db.session.commit()
#                 return jsonify({"msg": "Cantidad actualizada"}), 200
#         else:
#             return jsonify({"msg": "Cantidad inválida"}), 400

#     return jsonify({"msg": "Producto no encontrado"})

#ENDPOINTS PHONES    

@api.route('/load-phone', methods=['GET'])
def load_phone ():
    for phone in phones:
        new_phone = Smartphones(
            modelo = phone['modelo'],
            pantalla = phone['pantalla'],
            procesador = phone['procesador'],
            memoria_ram = phone['memoria_ram'],
            almacenamiento = phone['almacenamiento'],
            camara = phone['camara'],
            bateria = phone['bateria'],
            precio = phone['precio'],
            conectividad = phone['conectividad'],
            colores = phone['colores'],
            descripcion = phone['descripcion'],
            imagen = phone['imagen'],
            tipo = phone['tipo']
        )
        db.session.add(new_phone)
    db.session.commit()
    return jsonify({'msg': 'telefonos cargados'})    

@api.route('/phones', methods=['GET'])
def get_phones():
    phones = Smartphones.query.all()
    return jsonify([smartphones.serialize() for smartphones in phones]), 201

@api.route('/phone/<int:id_phone>', methods=['GET'])
def get_phones_individual(id_phone):
    phone = Smartphones.query.get(id_phone) 
    return jsonify(phone.serialize()), 201

@api.route('/phones/<int:id_smartphone>', methods=['DELETE'])
def delete_phones(id_smartphone):
    exist = Smartphones.query.filter_by(smartphone_id=id_smartphone).first()
    if exist:
        db.session.delete(exist)
        db.session.commit()
        return jsonify({"msg": "Smartphone deleted from data base"}), 201
    return jsonify({"msg": "No smartphone id was found"}), 400

#ENDPOINTS TVS

@api.route('/load-tvs', methods=['GET'])
def load_tvs():
    for tv in tvs:
        new_tv= TVs(
            marca = tv['marca'],
            contenido_de_la_caja = tv['contenido_de_la_caja'],
            modelo = tv['modelo'],
            usos_recomendados = tv['usos_recomendados'],
            año_modelo = tv['año_modelo'],
            fabricante = tv['fabricante'],
            precio = tv['precio'],
            descripcion = tv['descripcion'],
            pantalla = tv['pantalla'],
            conectividad = tv['conectividad'],
            medidas = tv['medidas'],
            imagen = tv['imagen'],
            tipo = tv['tipo']
        )
        db.session.add(new_tv)
    db.session.commit()
    return jsonify({'msg': 'tvs agregados'})

@api.route('/tvs', methods=['GET'])
def get_tvs():
    tvs = TVs.query.all()
    return jsonify([TVs.serialize() for TVs in tvs]), 201

@api.route('/tv/<int:id_tv>', methods=['GET'])
def get_tv_individual(id_tv):
    tv = TVs.query.get(id_tv)
    return jsonify(tv.serialize())

@api.route('/tvs/<int:id_tv>', methods=['DELETE'])
def delete_tvs(id_tv):
    exist = TVs.query.filter_by(tv_id=id_tv).first()
    if exist:
        db.session.delete(exist)
        db.session.commit()
        return jsonify({"msg": "TV deleted from data base"}), 201
    return jsonify({"msg": "No TV id was found"}), 400

#ENDPOINTS LAPTOPS

@api.route('/load-laptops', methods=['GET'])
def load_laptops():
    for laptop in laptops:
        new_laptop = Laptops(
            marca = laptop['marca'],
            modelo = laptop['modelo'],
            pantalla = laptop['pantalla'],
            procesador = laptop['procesador'],
            modelo_cpu = laptop['modelo_cpu'],
            sistema_operativo = laptop['sistema_operativo'],
            memoria_ram = laptop['memoria_ram'],
            almacenamiento = laptop['almacenamiento'],
            camara = laptop['camara'],
            bateria = laptop['bateria'],
            precio = laptop['precio'],
            tecnologia = laptop['tecnologia'],
            colores = laptop['colores'],
            descripcion = laptop['descripcion'],
            funcion_especial = laptop['funcion_especial'],
            descripcion_tarjeta_grafica = laptop['descripcion_tarjeta_grafica'],
            imagen = laptop['imagen'],
            tipo = laptop['tipo']
        )
        db.session.add(new_laptop)
    db.session.commit()
    return jsonify({'msg': 'laptops agregadas'}), 201
    
@api.route('/laptops', methods=['GET'])
def get_laptops():
    laptops = Laptops.query.all()
    return jsonify([Laptops.serialize() for Laptops in laptops]), 200

@api.route('/laptop/<int:id_laptop>', methods=['GET'])
def get_laptop_individual(id_laptop):
    laptop = Laptops.query.get(id_laptop)
    return jsonify(laptop.serialize())

@api.route('/laptops/<int:id_laptop>', methods=['DELETE'])
def delete_laptops(id_laptop):
    exist = Laptops.query.filter_by(laptop_id=id_laptop).first()
    if exist:
        db.session.delete(exist)
        db.session.commit()
        return jsonify({"msg": "Laptop deleted from data base"}), 200
    return jsonify({"msg": "No Laptop id was found"}), 400

    