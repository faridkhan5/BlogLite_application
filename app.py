from flask import Flask, render_template, flash, redirect, url_for, jsonify, request, make_response, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource,reqparse,marshal, Api,fields, marshal_with, abort
from datetime import datetime
from flask_marshmallow import Marshmallow
from flask_cors import CORS 
from flask_login import UserMixin, login_user, logout_user, LoginManager, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from datetime import datetime, timedelta
from celery import Celery, Task
from celery.schedules import crontab
from celery_system import make_celery
import random, time
from httplib2 import Http
from json import dumps
from io import BytesIO
from flask_caching import Cache

app = Flask(__name__)
app.app_context().push()
CORS(app)
app.config.update(
    CELERY_BROKER_URL="redis://localhost:6379/1",
    CELERY_RESULT_BACKEND="redis://localhost:6379/2",
)
#initialize api
api = Api(app)

cache = Cache(config={
    "CACHE_TYPE": "RedisCache",
    "CACHE_REDIS_HOST": "localhost",
    "CACHE_REDIS_PORT": "6379"
})
cache.init_app(app)

 
celery = make_celery(app)
@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    # sender.add_periodic_task(10.0, send_webhook.s(), name='add every 10')


    #Executes every Sunday morning at 7:30 a.m.
    sender.add_periodic_task(
        crontab(hour=18, minute=22),
        send_webhook.s(),
        name = 'periodic task'
    )


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bloglite.db'
db = SQLAlchemy(app)

app.config['SECRET_KEY'] = "helloworld"

ma = Marshmallow(app)


login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    return Users.query.get(int(id))


#------------celery tasks-------------------
@celery.task()
def return_random():
    time.sleep(3)
    return "Happy Sunday: " + str(random.random())

@celery.task()
def send_webhook():
    """Hangouts Chat incoming webhook quickstart."""
    url = 'https://chat.googleapis.com/v1/spaces/AAAAjv61ig8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=0tQBl0UAFVbQ-j5e0jB6ZNAMYDk6aMMDjSOrekeyTT4%3D'
    bot_message = {
        'text': "This is a reminder to make sure that you don't miss out on the latest blogs"}
    message_headers = {'Content-Type': 'application/json; charset=UTF-8'}
    http_obj = Http()
    response = http_obj.request(
        uri=url,
        method='POST',
        headers=message_headers,
        body=dumps(bot_message),
    )
     
#-----------------------------------------------



# users_json = {
#     "fullname": fields.String,
#     "email": fields.String
# }

#----------------------------------------DBMODELS------------------------------------------------

followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('following_id', db.Integer, db.ForeignKey('users.id'))
)


class Users(db.Model, UserMixin):
    # __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200),unique=True, nullable=False)
    username = db.Column(db.String(200),unique=True, nullable=False)
    password = db.Column(db.String(200),nullable=False)
    blogs = db.relationship('Blogs',backref='blog_user')
    
    following = db.relationship(
        'Users', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.following_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    def is_following(self, user):
        return self.following.filter(
            followers.c.following_id == user.id).count() > 0

    def follow(self, user):
        if not self.is_following(user):
            self.following.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.following.remove(user)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'password': self.password
        }


class Blogs(db.Model):
    __tablename__ = 'blogs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100),nullable=False)
    date_created = db.Column(db.DateTime,default=datetime.utcnow)
    content = db.Column(db.String(255),nullable=False)
    image_url = db.Column(db.String(), nullable=False)
    blog_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __init__(self, title, content, image_url, blog_user_id, date_created):
        self.title = title
        self.content = content
        self.image_url = image_url
        self.blog_user_id = blog_user_id
        self.date_created = date_created

#----------------------------------------END DBMODELS----------------------------------------

#to check whether token is passed along request
#also to check whether that token is valid
def token_required(f):
    
    def decorated(*args, **kwargs):
        token = None

        #tokens are stored in headers
        if 'x-access-token' in request.headers:
            #extract token from request headers
            token = request.headers['x-access-token']
        
        if not token:
            return jsonify({'message': 'token is missing'}), 401
        
        try:
            #decode token
            data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=["HS256"])
            #extract user id from decoded token
            current_user = Users.query.filter_by(id=data['id']).first()
        except:
            return jsonify({'message': 'token is invalid'}), 401
        
        #if it passes except block, it means that the token is valid
        #valid token = user -> current_user
        #we pass that user object to the route
        return f(*args, **kwargs)
    return decorated


#------------------------------------------ROUTES---------------------------------------------------
@app.route("/", methods = ['GET'])
def base():
    return render_template("index.html")


@app.route('/register', methods=['GET','POST'])
def register():
    email = request.json['email']
    username = request.json['username']
    password = request.json['password']
    hashed_password = generate_password_hash(password)
    new_user = Users(email=email, username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'new user created'})


@app.route('/login', methods=['GET','POST'])

def login():
    user_dict = {}
    #object to retrieve the username and password that were provided in the HTTP request header.
    auth = request.authorization
    #3 cases
    username = request.json['username']
    password = request.json['password']

        # if not auth or not auth.username or not auth.password:
        #     return make_response('could not verify', 401)
    
    user = Users.query.filter_by(username=username).first()

    if not user:
        return make_response('User does not exist', 401)
    
    #return jwt token on if auth password matches user password in DB
    if check_password_hash(user.password, password):
        # user id is included in the token's payload
        token = jwt.encode({'id': user.id}, app.config['SECRET_KEY'])
        user_dict['id'] = user.id
        user_dict['username'] = user.username
        user_dict['token'] = str(token)
        print("login details")
        print(user_dict)
        return jsonify(user_dict)
        # return jsonify({'token': token.decode('UTF-8')})

    return make_response('Incorrect Password', 401)

@app.route('/logout', methods=['GET','POST'])
@token_required
def logout():
    token = request.headers['x-access-token']
    data = jwt.decode(token, app.config['SECRET_KEY'])
    user = Users.query.filter_by(id = data['id']).first()
    logout_user(user)
    return {"message": "Logout Successful"}, 200


#----------profile---------------------------
@app.route("/profile")
def profile():
    return render_template('profile.html')

@app.route("/user_profile")
@login_required
def user_profile():
    profile_user = Users.query.get_or_404(current_user.id)
    user_blogs = Blogs.query.filter_by(blog_user_id=current_user.id).all()
    noofposts = Blogs.query.filter_by(blog_user_id=current_user.id).count()
    return render_template('user_profile.html',user_blogs=user_blogs,profile_user=profile_user,noofposts=noofposts)


@app.route("/export/<int:user_id>",methods=['GET'])
def export_blogs(user_id):
    user = Users.query.filter_by(id=user_id).first()
    blogs=Blogs.query.filter_by(blog_user_id=user_id).all()
    with open(f'csvs/{user_id}_blogs.csv', 'w') as blog_csv:    
        for i in range(len(blogs)):
            blog = blogs[i]
            print(blog)
            blog_csv.write(f'{i+1},{blog.title},"{blog.image_url}","{blog.content}"\n')

    return send_from_directory("csvs",f'{user_id}_blogs.csv')

#---------------------------------END ROUTES------------------------------------------------


#----------------------------------API-----------------------------------------------

# class HelloWorld(Resource):
#     def get(self, name, age):
#         return {"name": name,
#                 "age": age}  

user_resource_fields = {
    'id':fields.Integer,
    'email': fields.String,
    'username': fields.String
}

blog_resource_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'content': fields.String,
    'image_url': fields.String,
    'blog_user_id': fields.Integer,
    'date_created': fields.String
}

follow_json = {
    "msg": fields.String
}

user_blog_resource_fields = {
    'user': fields.Nested(user_resource_fields),
    'blogs': fields.List(fields.Nested(blog_resource_fields)),
    'followers': fields.Integer, 
    'following': fields.Integer
}


search_user_resource_fields = {
    ''
}



class Blogs_api(Resource):
    @cache.memoize(300)
    @marshal_with(blog_resource_fields)
    @token_required
    def get(self):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=['HS256'])
        # user = Users.query.filter_by(id = id).first() 
        # blog = Blogs.query.filter_by(blog_user_id = user.id).all()
        all_blogs = Blogs.query.order_by(Blogs.date_created.desc()).all()
        return all_blogs
    
 
class Blog_api(Resource):
    @cache.memoize(60)
    @marshal_with(blog_resource_fields)
    @token_required
    def get(self, id):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        blog = Blogs.query.filter(Blogs.id==id).one()
        return blog
    
    @marshal_with(blog_resource_fields)
    @token_required
    def post(self):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        #to get json data into our server
        user = Users.query.filter_by(id=data['id']).first()

        title = request.json['title']
        content = request.json['content']
        image_url = request.json['image_url']

        # title = args.get('title')
        # content = args.get('content')
        # image_url = args.get('image_url')
        date_created=datetime.now()
        blog = Blogs(title=title, content=content,image_url=image_url, blog_user_id=user.id, date_created=date_created)
        db.session.add(blog)
        db.session.commit()
        cache.delete_memoized(Blogs_api.get) 
        cache.delete_memoized(Blog_api.get) 
        return blog
    
    @marshal_with(blog_resource_fields)
    @token_required
    def put(self, id):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])

        blog = Blogs.query.get(id)
        #updated fields given by the user
        title = request.json['title']
        content = request.json['content']
        image_url = request.json['image_url']

        #replacing old with updated fields
        blog.title = title
        blog.content = content
        blog.image_url = image_url
        blog.date_created = datetime.now()
        db.session.commit()
        cache.delete_memoized(Blogs_api.get)
        cache.delete_memoized(Blog_api.get)

        return blog
    
    @marshal_with(blog_resource_fields)
    @token_required
    def delete(self, id):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        blog = Blogs.query.get(id)
        db.session.delete(blog)
        db.session.commit()
        cache.delete_memoized(Blogs_api.get)
        cache.delete_memoized(Blog_api.get)
        return blog

        
#------UserProfile-----
class MyProfile_api(Resource):
    @cache.memoize(60)
    @marshal_with(user_blog_resource_fields)
    @token_required
    def get(self):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user = Users.query.filter_by(id = data['id']).first() 
        blogs = Blogs.query.filter_by(blog_user_id = data['id']).order_by(Blogs.date_created.desc()).all()
        query1 = followers.select().where(followers.c.follower_id == data['id'])
        result1 = db.session.execute(query1).fetchall()
        query2 = followers.select().where(followers.c.following_id == data['id'])
        result2 = db.session.execute(query2).fetchall()
        print("----------------------------------")
        print(len(result2))
        return {'user': user, 'blogs': blogs, 'followers': len(result2), 'following': len(result1)}, 200
        # return user, 200


#-----followers----------
class UserProfile_api(Resource):
    @cache.memoize(60)
    @marshal_with(user_blog_resource_fields)
    @token_required
    def get(self, id):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user = Users.query.filter_by(id = id).first() 
        blogs = Blogs.query.filter_by(blog_user_id = id).order_by(Blogs.date_created.desc()).all()
        query1 = followers.select().where(followers.c.follower_id == id)
        result1 = db.session.execute(query1).fetchall()
        query2 = followers.select().where(followers.c.following_id == id)
        result2 = db.session.execute(query2).fetchall()

        return {'user': user, 'blogs': blogs, 'followers': len(result2), 'following': len(result1)}, 200


class Follow_api(Resource):
    @marshal_with(user_resource_fields)
    @token_required
    def post(self, id):
        print("-------------------------------")
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        following_id = request.json['following_id']
        query1 = followers.select().where(followers.c.follower_id == data['id'], followers.c.following_id == following_id)
        result1 = db.session.execute(query1).fetchall()
        if len(result1) > 0:
            return {"msg": "Cannot follow user you are already following"}
        new_friend = {'following_id' : following_id, 'follower_id' : data['id']}
        db.session.execute(followers.insert(), new_friend)
        db.session.commit()
        cache.delete_memoized(MyProfile_api.get)
        cache.delete_memoized(UserProfile_api.get)
        return new_friend

class Unfollow_api(Resource):
    @token_required
    @marshal_with(follow_json)
    def post(self, id):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        following_id = request.json['following_id']
        delete_st = followers.delete().where(followers.c.following_id == following_id,followers.c.follower_id == data['id'])
        db.session.execute(delete_st)
        db.session.commit()
        cache.delete_memoized(MyProfile_api.get)
        cache.delete_memoized(UserProfile_api.get)
        return {"msg": "Unfollowed"}

class SearchUser_api(Resource):
    @token_required
    @marshal_with(user_resource_fields)
    def post(self):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        search_query = request.json.get('searchquery')
        matching_users = Users.query.filter(Users.username.like(f'%{search_query}%')).all()
        return matching_users



# api.add_resource(HelloWorld, "/helloworld/<string:name>/<int>:age")
api.add_resource(Blogs_api, "/Blogs")
api.add_resource(Blog_api, "/Blog", "/Blog/<int:id>") 
api.add_resource(MyProfile_api, '/MyProfile')
api.add_resource(UserProfile_api, "/UserProfile/<int:id>")
api.add_resource(Follow_api, "/Follow/<int:id>")
api.add_resource(Unfollow_api, "/Unfollow/<int:id>")
api.add_resource(SearchUser_api, "/SearchUser")
#-----------------------------------END API--------------------------------------------------



if __name__=='__main__':
    db.create_all()
    app.run(debug=True)