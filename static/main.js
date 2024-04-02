//------------------------------------COMPONENTS------------------------------------

//-------Navbar-------------
const navbar_comp = Vue.component('navbar', {
  props: [],
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Navbar</a>
  <router-link class="navbar-brand" to="/">flask and vue</router-link>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <router-link class="btn btn-primary" to="/Blogs">Home</router-link>
        
      </li>
      <li class="nav-item">
        <router-link class="btn btn-success" to="/Blog/add">Add Blog</router-link>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Dropdown
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#">Something else here</a>
        </div>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#">Disabled</a>
      </li>
    </ul>
    <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
  </div>
</nav>
  `,
  data: function() {
      return {
          
      }
  },
  methods:{

  },
 
  computed:{
    isLoggedIn() {
      const token = localStorage.getItem('token');
      return token !== null && token !== undefined;
    }
  }
})

const navbar_user_comp = Vue.component('navbar_user', {
  props: [],
  template: `
  <div>
    
    <div v-if="isLoggedIn">
      <nav class="navbar navbar-dark home_navbar">
        <div class="container-fluid">  
          <router-link class="navbar-brand" to="/Blogs">
              Home
          </router-link>

          <form class="d-flex searchbar_home" role="search">
          <input class="form-control me-2 searchbar_form" type="search" placeholder="Search User" aria-label="Search" name="searched_username" v-model="searchquery">
          <button class="btn btn-outline-success" type="submit" v-on:click.prevent="searchUser">Search</button>
          
          </form>
          
          <router-link to="/Blog/add" class="newblog_link btn btn-success">
            New Blog
          </router-link>
          
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle profile_dropdown rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-on:click="toggleDropdown">
              Profile
            </button>

            <ul class="dropdown-menu dropdown-menu-dark profile_dropdown_options dropdown-menu-lg-end" :class="{ show: isDropdownOpen }">
            <li>
              <router-link class="dropdown-item" to="/MyProfile">
                Profile
              </router-link>
            </li>
              
              <li>
                  <button class="dropdown-item" v-on:click="logoutUser">
                  Logout
                </button>
              </li>
              
            </ul>
          </div>

        </div>
      </nav>
    </div>

    <div v-else>  
      <nav class="navbar navbar-dark home_navbar">
        <div class="container-fluid">
          
          <router-link class="navbar-brand" to="/Blogs">
              Home
          </router-link>
          
          <router-link to="/register" button type="button" class="btn btn-primary">
            Register
          </router-link>
          <router-link to="/login" button class="btn btn-outline-success home_btn" type="button">
            Login
          </router-link>
          
        </div>
      </nav>
    </div>

  </div>
  `,
  data: function() {
      return {
          //toggles visibility of dropdown menu
          isDropdownOpen: false,
          searchquery: "",
          searchresults_arr: [],
      }
  },
  methods:{
    //updates the dropdown data property
    //but we need to apply :class binding to dynamically apply
    // the 'show' class when isDropdownOpen is true
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    logoutUser(){
      localStorage.clear();
      router.replace("/")
    },
    searchUser: async function() {
      console.log(this.searchquery)
      fetch("/SearchUser", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": window.location.origin,
          'x-access-token': localStorage.getItem("token"),
        },
        body: JSON.stringify({ "searchquery" : this.searchquery })
      })
        .then(response => response.json())
        .then(data => {
          // data will contain the list of usernames that match the search query
          this.searchresults_arr.push(...data)
          console.log(this.searchresults_arr);
          router.push({
            name: 'searchuser',
            params: {searchresults_arr: data}
          })
        })
        .catch(error => console.log(error))
    }
  },
  
  computed:{
    isLoggedIn() {
      const token = localStorage.getItem('token');
      return token !== null && token !== undefined;
    },
  },
  watch: {
    '$route': function() {
      this.$forceUpdate();
    },
    'isLoggedIn': function(val) {
      this.$forceUpdate();
    }
  }
  })

const navbar_register_login_comp = Vue.component('navbar_register_login', {
  props: [],
  template: `
  <div>
    <nav class="navbar navbar-dark home_navbar">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/Blogs">
            Home
        </router-link>
        
        <router-link to="/register" button type="button" class="btn btn-primary">
          Register
        </router-link>
        <router-link to="/login" button class="btn btn-outline-success home_btn" type="button">
          Login
        </router-link>
    
      </div>
    </nav>  
  </div>
  `,
  data: function() {
      return {
          
      }
  },
  methods:{
  
  },
  
  computed:{
    isLoggedIn() {
      const token = localStorage.getItem('token');
      return token !== null && token !== undefined;
    }
  }
  })


const home_comp = Vue.component('Home', {
  components:{
    'navbar_register_login': navbar_register_login_comp
  },
  template:`
  <div>
    <navbar_register_login></navbar_register_login>
    <h1 class="mainheader"> Blog Lite Application </h1>
  </div>
  
  `
})




//------------Register------------


const register_comp = Vue.component('Register', {
  components: {
    'navbar_register_login': navbar_register_login_comp
  },
  props: [],
  template: `
      <div class="my-3">
        <h3 style="margin-left:40%"> Register </h3>
        <div class="user_form">
          <form method="POST">
            <label class="form-label">Email</label>
            <input type="text" class="form-control" v-model="email" placeholder="enter email" />
            <br/>
            <label class="form-label">Username</label>
            <input type="text" class="form-control" v-model="username" placeholder="enter username" />
            <br/>
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="password" placeholder="enter password" />
            <br/>
            <button class="btn btn-success" v-on:click.prevent="registerUser">Register</button>
          </form>
        </div>
      </div>
  `,
  data: function() {
      return {
        email:'',
        username: '',
        password: '',
        
      }
  },
  methods:{
    registerUser: async function(){
      if(!this.email || !this.username || !this.password ){
        this.error = "Please enter all the fields"
      }
      else{
        let result = await fetch("http://127.0.0.1:5000/register", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            'email':this.email,
            'username':this.username,
            'password': this.password
          })
        });
        //waiting for the server's response by calling the `json` method on `result` object
        //it then returns a promise that resolves to the response body parsed as JSON
        const data = await result.json;
        console.log(data);
        //if server returns error, method sets the error property to the error message returned by server
        if(!result.ok){
          this.error = data['message']
        }
        else{
          //store user's username in browser's local storage
          localStorage.setItem('username', data['user'])
          //redirect to homepage
          router.replace('/')
        } 
      }
    }
  },
  
  computed:{
  
  }
  })
  
//---------login--------------
const login_comp = Vue.component('Login', {
  props: [],
  template: `
      <div>
        <h3 style="margin-left:40%" class="my-3"> Login </h3>
        <div class="user_form">
          <form method="POST">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" v-model="username" placeholder="enter username" />
            <br/>
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="password" placeholder="enter password" />
            <br/>
            <button class="btn btn-success" v-on:click.prevent="loginUser">Login</button>
          </form>
        </div>
      </div>
  `,
  data: function() {
      return {
        username: '',
        password: '',
        
      }
  },
  methods:{
    // changeAuth: function () {
    //   //changing auth state to not authenticated
    //   store.commit('auth_mutate', 0)
    // },

    loginUser: async function(){
      if(!this.username || !this.password ){
        this.error = "Please enter all the fields"
      }
      else{
        let result = await fetch("/login", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            'username':this.username,
            'password': this.password
          })
        });
        //waiting for the server's response by calling the `json` method on `result` object
        //it then returns a promise that resolves to the response body parsed as JSON
        const data = await result.json();
        console.log(data);
        //if server returns error, method sets the error property to the error message returned by server
        if(!result.ok){
          this.error = data['message']
        }
        else{
          //store token, id, username in browser's local storage
          localStorage.setItem('token', data['token'])
          localStorage.setItem('id', data['id'])
          localStorage.setItem('username', data['username'])

          // store.commit('token_mutate', data['token']);
          // //changing auth state to logged in
          // store.commit('auth_mutate', 2);
          // store.commit('name_mutate', data['user'])
          //redirect to homepage
          router.replace('/Blogs')
        } 

        this.username = "";
        this.password = "";
      }
    }
  },
  
  computed:{
  
  }
  })

//logout
const logout_comp = Vue.component('Logout', {
  props: [],
  template: `
      <div class="user_form">
        <form method="POST">
          <label class="form-label">Username</label>
          <input type="text" class="form-control" v-model="username" placeholder="enter username" />
          <br/>
          <label class="form-label">Password</label>
          <input type="password" class="form-control" v-model="password" placeholder="enter password" />
          <br/>
          <button class="btn btn-success" v-on:click.prevent="loginUser">Login</button>
        </form>
      </div>
  `,
  data: function() {
      return {
        username: '',
        password: '',
        
      }
  },
  methods:{
    // changeAuth: function () {
    //   //changing auth state to not authenticated
    //   store.commit('auth_mutate', 0)
    // },

    loginUser: async function(){
      if(!this.username || !this.password ){
        this.error = "Please enter all the fields"
      }
      else{
        let result = await fetch("/login", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            'username':this.username,
            'password': this.password
          })
        });
        //waiting for the server's response by calling the `json` method on `result` object
        //it then returns a promise that resolves to the response body parsed as JSON
        const data = await result.json();
        console.log(data);
        //if server returns error, method sets the error property to the error message returned by server
        if(!result.ok){
          this.error = data['message']
        }
        else{
          //store token, id, username in browser's local storage
          localStorage.setItem('token', data['token'])
          localStorage.setItem('id', data['id'])
          localStorage.setItem('username', data['username'])

          // store.commit('token_mutate', data['token']);
          // //changing auth state to logged in
          // store.commit('auth_mutate', 2);
          // store.commit('name_mutate', data['user'])
          //redirect to homepage
          router.replace('/Blogs')
        } 

        this.username = "";
        this.password = "";
      }
    }
  },
  
  computed:{
  
  }
  })



//-------------------------AllBlogs------------------------
const blogs_comp = Vue.component('Blogs', {
    components: {
      'navbar_user': navbar_user_comp
    },
    template: `
    <div>
    <navbar_user></navbar_user>
      <div class="container mt-5">
        <div v-for="blog in blogs_arr" v-bind:key="blog.id"> 
            <h3>
              <router-link :to="{name: 'blogview', params:{id: blog.id}}">
                {{blog.title}}
              </router-link>
            </h3>
            <span>
                      <small class="blogs_username_date"><font color="white">By : </font> {{blog.blog_user_id}}</small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <small class="blogs_username_date"><font color="white">Date :  </font>{{formattedDate(blog.date_created)}}</small>
            </span>
            
            <div class="blogs_image">
              <img :src="blog.image_url" width="400px">
            </div>
            <br>
            <div>
              {{blog.content}}
            </div>
            <hr>
        </div>
      </div>
    </div>
    `,
    data: function(){
      return {
        blogs_arr : [],
      }
      
    },
    methods:{
      getBlogs: function(){
        fetch("/Blogs",{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem('token'),
          }
        })
        .then(resp => resp.json())
        .then(data => {
          this.blogs_arr.push(...data)
          console.log(this.blogs_arr);
        })
        .catch(error => {
          console.log(error)
        })
      }
    },
    
    created(){
      this.getBlogs()
    },
    computed: {
      formattedDate(){
        return function(date_created){
          const date = new Date(date_created);
          return date.toLocaleDateString('en-US');
        }
      }
    }

})


//-----------------Blog-------------------

//addBlog
const addBlog_comp = Vue.component('AddBlog', {
    components: {
      'navbar_user': navbar_user_comp
    },
    template: `
    <div>
      <navbar_user></navbar_user>
      <h4 class="my-3" style="margin-left:40px">Post New Blog</h4>
      <form style="margin-left:40px;">
          <input 
          type="text"
          class="form-control mt-4"
          placeholder="enter your title"
          id="title"
          v-model="title"/>

          <textarea rows="10"
          class="form-control mt-4"
          placeholder="enter your content"
          id="content"
          v-model="content"></textarea>
          <div v-html="content | parseHTML"></div>
          
          <input 
          type="text"
          class="form-control mt-4"
          placeholder="enter image url"
          v-model="image_url"/>

          <router-link to="/Blogs">
            <button class="btn btn-success mt-4" type="submit" v-on:click="addBlog">Post</button>
          </router-link>
      </form>
      <div>{{error}}</div>
    </div>
    `,
    data: function(){
      return {
        title:null,
        content:null,
        image_url:null,
        id: localStorage.getItem("id"),
        error:null
      }
    },
    methods:{
      addBlog: async function(){
        const res = await fetch('/Blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": window.location.origin,
                'x-access-token': localStorage.getItem("token"),
            },
            body: JSON.stringify({
                "title":this.title,
                "content": this.content,
                "image_url": this.image_url
            })
        });
        console.log(localStorage.getItem("token"))
        const data = await res.json();
        console.log(data)
        
        if (!res.ok){
            this.err = data["message"]
        } else {
            router.replace(`/Blogs`); 
        }
      }
    },
    
    
})

//view and delete blog
const blogView_comp = Vue.component('Blog-View', {
  template: `
  <div class="container mt-5">
    <h2> {{blog.title}} </h2>
    <span>
      <small class="blogs_username_date"><font color="white">
        By : </font> 
          <router-link :to="{name:'userprofile', params:{id: blog.blog_user_id}}">
            {{blog.blog_user_id}}
          </router-link>
      </small>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <small class="blogs_username_date">
        <font color="white">Date :  </font>{{formattedDate(blog.date_created)}}
      </small>
    </span>
    <div class="blogs_image">
      <img :src="blog.image_url" width="200px">
    </div>
    <br>
    <p> {{blog.content}} </p>
    
    <div class="blog_back_edit_delete_container">
            <router-link to="/Blogs">
                <button type="button" class="btn btn-outline-primary blog_back_edit_delete_btn">Back</button>
            </router-link>
            
            <router-link :to="{name:'blogupdate', params:{id:blog.id}}" v-if="blog.blog_user_id == user_id">
              <button type="button" class="btn btn-outline-warning blog_back_edit_delete_btn">
                Edit
              </button>
            </router-link>
            <button type="button" class="btn btn-outline-danger blog_back_edit_delete_btn" v-on:click="deleteBlog" v-if="blog.blog_user_id == user_id">
              Delete
            </button>       
    </div>
  `,
  data: function(){
    return {
      blog : {},
      user_id: localStorage.getItem('id'),

    }
  },
  props:{
    id: {
      type:[Number, String],
      required: true  
    }
  },
  methods:{
    getBlogData: function(){
      fetch(`/Blog/${this.id}`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'x-access-token': localStorage.getItem("token"),
        }
      })
      .then(resp =>resp.json())
      .then(data => {
        console.log(data)
        this.blog = data
      })
      .catch(error => {
        console.log(error)
      })
    },

    deleteBlog: function(){
      fetch(`/Blog/${this.id}`,{
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'x-access-token': localStorage.getItem("token"),
        }
      })
      .then( () => {
        this.$router.push('/Blogs')
      })
      .catch(error => {
        console.log(error)
      })
    }
  },
  created(){
    this.getBlogData()
  },
  computed:{
    isLoggedIn() {
      const token = localStorage.getItem('token');
      return token !== null && token !== undefined;
    },
    formattedDate(){
      return function(date_created){
        const date = new Date(date_created);
        return date.toLocaleDateString('en-US');
      }
    }
    
  }
})


//updateBlog
const blogUpdate_comp = Vue.component('Blog-update',{
  template: `
  <div class="mx-5 my-5">
  <form v-on:submit.prevent="updateBlog">
      <input 
      type="text"
      class="form-control"
      placeholder="enter your title"
      v-model="title"/>

      <textarea rows="10"
      class="form-control my-5"
      placeholder="enter your content"
      v-model="content"></textarea>

      <input 
      type="text"
      class="form-control mt-4"
      placeholder="enter image url"
      v-model="image_url"/>

      <button
      class="btn btn-success mt-4">
          Update Blog
      </button>
  </form>
  <div v-if="error" class="alert alert-warning alert-dismissable" role="alert">
      <strong>{{error}}</strong>
  </div>
</div>
  `,
  props:{
    id: {
      type: [Number, String],
      required: true,
    }
  },
  data: function(){
    return {
      title:null,
      content:null,
      image_url:null,
      error:null
    }
  },
  methods: {
    updateBlog: function(){
      if(!this.title || !this.content || !this.image_url){
        this.error = "Please enter all the fields"
      }
      else{
        fetch(`/Blog/${this.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            'x-access-token': localStorage.getItem("token")
          },
          body: JSON.stringify({
            'title':this.title,
            'content': this.content,
            'image_url': this.image_url
          })
        })
        .then(resp => resp.json())
        .then(() => {
          //navigate user to the '/Blogs' route using the VueJS router
          this.$router.push('/Blogs')
        })
      }
    }
  },

  //router hook executed before route is entered
  beforeRouteEnter (to, from, next) {
    if(to.params.id !== undefined){
      //send a get request to the endpoint if 'id' is provided
      fetch(`/Blog/${to.params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(resp => resp.json())
      .then(data => {
        //next function is called with a callback func that sets the title, content, image_url of the
        //component's view model (vm) to the corresponding data from the API
        return next(vm=>(vm.title=data.title, vm.content=data.content, vm.image_url=data.image_url))
      })
      .catch(error => {
        console.log(error)
      })
    }
    else{
      return next()
    }
  }
})


//-------------MYPROFILE-------------
const myProfile_comp = Vue.component('MyProfile-View', {
  component: {
    navbar_user: "navbar_user_comp"
  },
  template: `
  <div>
  <navbar_user></navbar_user>
    <div class="card mb-4 user_profile_container">
      <div class="card-body text-center">
        <h3 class="my-3">{{ user.username }}</h3>
        <div class="row mt-5">
          <div class="col border-right text-center">
            <h5 class="font-light">{{ user_blogs.length }}</h5>
            <p>Blogs</p> 
          </div>
          <div class="col border-right text-center">
              <h5 class="font-light">{{followerlen}}</h5>
              <p>Followers</p>
          </div>
          <div class="col text-center">
              <h5 class="font-light">{{followinglen}}</h5>
              <p>Following</p>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <br><br>
    <div>
      <h3 align="center">My Blogs</h3>
    </div>
    <br>
    <div v-for="user_blog in user_blogs" :key="user_blog.id">
        <div class="shadow p-3 mb-5 rounded blog_show">
          <router-link :to="{name: 'blogview', params: {id: user_blog.id}}" class="blogs_title"><h3>{{user_blog.title}}</h3></router-link>
          <span>
              <small class="blogs_username_date"><font color="white">By : </font>{{user_blog.blog_user_id}}</small> &nbsp&nbsp&nbsp&nbsp;
              <small class="blogs_username_date"><font color="white">Date : </font>{{formattedDate(user_blog.date_created)}}</small>
          </span>
          <div class="blogs_image">
            <img :src="user_blog.image_url" width="300px">
          </div>
          <br>
          <div>
              {{user_blog.content}}
          </div>
        </div>
        <hr>
    </div>
    <div>
      <button class="btn btn-outline-primary me-2 export_btn" v-on:click="exportCsv">
        Export
      </button> 
      <br><br>
    </div>

  </div>

  `,
  data: function(){
    return {
      user_id: localStorage.getItem("id"),
      user:{},
      user_blogs : [],  
      followinglen: 0,
      followerlen: 0    
    }
  },
  methods:{
    exportCsv: async function() {
      const res = await fetch(`/export/${this.user_id}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": window.location.origin,
          'x-access-token': localStorage.getItem("token"),
        }
      })
      .then((res) => {
        if (res.ok) {
          return res.blob();
        } else if (res.status === 401) {
          throw new Error();
        }
      })
      .then((file) => {
        const blob = new Blob([file], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.user_id}_card.csv`;
        a.click();
      });
    }
  },
  mounted: function(){
      fetch('/MyProfile',{
        headers: {
          "Content-Type": "application/json",
          'x-access-token': localStorage.getItem("token"),
        }
      })
      .then(resp =>resp.json())
      .then(data => {
        console.log(data)
        this.user = data.user
        this.user_blogs = data.blogs
        this.followinglen = data.following
        this.followerlen = data.followers
      })
      .catch(error => {
        console.log(error)
      })
  },
  computed: {
    formattedDate(){
      return function(date_created){
        const date = new Date(date_created);
        return date.toLocaleDateString('en-US');
      }
    }
  }
})

//------------USERPROFILE--------------
const userProfile_comp = Vue.component('UserProfile_view', {
  component: {
    navbar_user: "navbar_user_comp"
  },
  template: `
  <div>
    <navbar_user></navbar_user>
    <div class="card mb-4 user_profile_container">
      <div class="card-body text-center">
        <h3 class="my-3">{{ following_user.username }}</h3>
        <div class="row mt-5">
          <div class="col border-right text-center">
            <h5 class="font-light">{{ following_user_blogs.length }}</h5>
            <p>Blogs</p> 
          </div>
          <div class="col border-right text-center">
              <h5 class="font-light">{{followerlen}}</h5>
              <p>Followers</p>
          </div>
          <div class="col text-center">
              <h5 class="font-light">{{followinglen}}</h5>
              <p>Following</p>
          </div>
        </div>
        <br>
        <div class="row mt-3"  v-if="following_user.id != userid">
          <div class="col border-right text-center">
              <button class="btn btn-success" @click="follow">Follow</button>
          </div>
          <div class="col text-center">
              <button class="btn btn-danger" @click="unfollow(id)">Unfollow</button>
          </div>
        </div>        
      </div>
    </div>
    <br><br>
    <div>
      <h3 align="center">Blogs</h3>
    </div>
    <br><br>
    <div v-for="blog in following_user_blogs" :key="blog.id">
        <div class="shadow p-3 mb-5 rounded blog_show">
          <router-link :to="{name: 'blogview', params: {id: blog.id}}" class="blogs_title"><h3>{{blog.title}}</h3></router-link>
          <span>
              <small class="blogs_username_date"><font color="white">By : {{blog.blog_user_id}}</small> &nbsp&nbsp&nbsp&nbsp;
              <small class="blogs_username_date"><font color="white">Date : </font>{{blog.date_created}}</small>
          </span>
          <div class="blogs_image">
            <img :src="blog.image_url" width="300px">
          </div>
          <br>
          <div>
              {{blog.content}}
          </div>
        </div>
        <hr>
    </div>
  </div>
  `,
  data: function(){
    return {
      following_user:{},
      following_user_blogs:[],
      userid: localStorage.getItem("id"),
      error:null,
      followinglen: 0,
      followerlen: 0
    }
  },
  props:{
    id: {
      type:[Number, String],
      required: true  
    }
  },
  methods:{
    follow: async function(){
      const result = await fetch(`/Follow/${this.id}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": window.location.origin,
          'x-access-token': localStorage.getItem("token"),
      },
      body: JSON.stringify({
          // 'follower_id':this.user_id,
          'following_id': this.id
      })
      });
      const data = await result.json();
      this.following=data

      if (data.status===400){
        alert('cannot follow yourself')
      }
      if(data.status===401){
        alert('already following this user')
      }
    },
    unfollow: async function(id){
      console.log(id)
      const res = await fetch(`/Unfollow/${this.id}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": window.location.origin,
              'x-access-token': localStorage.getItem("token"),
          },
          body: JSON.stringify({  
              'following_id':this.id

          })
      });

      const data = await res.json();
      console.log(data)

      if (res.status===401){
        alert('cannot unfollow account which you have not followed')
      }
    }   
  },
  mounted: function(){
    fetch(`/UserProfile/${this.id}`,{
      method:"GET",
      headers: {
        "Content-Type": "application/json",
        'x-access-token': localStorage.getItem("token"),
      }
    })
    .then(resp =>resp.json())
    .then(data => {
      console.log(data)
      this.following_user = data.user
      this.following_user_blogs = data.blogs
      this.followinglen = data.following
      this.followerlen = data.followers
    })
    .catch(error => {
      console.log(error)
    })
  }
})


const searchUser_comp = Vue.component('searchuser', {
  props: ['searchresults_arr'],
  template:`
  <div>
    <h2 class="my-3" align="center"> Search Results </h2>
    <br><br>
      <div v-for="user in searchresults_arr" :key="user.id">
      <div class="shadow p-3 mb-5 rounded searched_user_show">
        <router-link :to="{name:'userprofile', params:{id: user.id}}" class="searched_user_show_username">
          <h5>{{user.username}}</h5>
        </router-link>
      </div>
      </div>
  </div>  
  `
})


//------------------------------END-COMPONENTS----------------------------------------




//-----------------------------------------ROUTES--------------------------------------------
const routes = [
    {
      path:"/",
      component: home_comp
    },
    {
        path:"/Blogs",
        component: blogs_comp
    },
    {
        path:"/Blog/add",
        component:addBlog_comp
    },
    {
        path:'/Blog/view/:id',
        name: "blogview",
        component:blogView_comp,
        props: true
    },
    {
      path:'/Blog/update/:id',
      name: "blogupdate",
      component:blogUpdate_comp,
      props: true
    },
    {
      path: '/register',
      component: register_comp
    },
    {
      path: '/login',
      component: login_comp
    },
    {
      path: '/MyProfile',
      component: myProfile_comp
    },
    {
      path:'/userprofile/:id',
      name:'userprofile',
      component: userProfile_comp,
      props: true
    },
    {
      path:'/searchuser',
      name:'searchuser',
      component: searchUser_comp,
      props: true
    },
    {
      path:'/logout'

    }
]

const router = new VueRouter({
    routes
})
//-----------------------------------------ENDROUTES----------------------------------------



var app = new Vue({
    el: "#app",
    router: router,
    data: {

    },
    methods:{
        
    }
})