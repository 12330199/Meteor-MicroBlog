/**
 * Created by jiangink on 15/6/14.
 */

Session.setDefault("currentUrl", {index: "active", login: "", reg: ""});

Session.setDefault("info", {success: "", error: ""});
Template.info.info = function () {
  return Session.get("info");
};

Template.container.currentUrl = function () {
  return Session.get("currentUrl");
};

Template.nav.active = function () {
  return Session.get("currentUrl");
};

Template.reg.events({
  'click #submit': function (evt) {
    evt.preventDefault();
    var $username = $("#username").val();
    var $password = $("#password").val();
    var $password_repeat = $("#password-repeat").val();
    if ($password.length === 0 || $username.length === 0) {
      Session.set("info", {success: "", error: "用戶名或密碼不能為空"});
      return;
    }
    if ($password !== $password_repeat) {
      Session.set("info", {success: "", error: "兩次輸入密碼不一致"});
      return;
    }
    Accounts.createUser({username: $("#username").val(), password: $("#password").val()}, function (err) {
      if (err) {
        Session.set("info", {success: "", error: err.reason});
      }else {
        Router.redirect("/");
        Session.set("info", {success: "註冊成功", error: ""});
      }
    });
  }
});

Template.login.events({
  'click #submit': function (evt) {
    evt.preventDefault();
    var $username = $("#username").val();
    var $password = $("#password").val();
    if ($password.length === 0 || $username.length === 0) {
      Session.set("info", {success: "", error: "用戶名或密碼不能為空"});
      return;
    }
    Meteor.loginWithPassword($username, $password, function(err) {
      if (err) {
        Session.set("info", {success: "", error: err.reason});
      } else {
        Router.redirect("/");
        Session.set("info", {success: "登陸成功", error: ""})
      }
    });
  }
});

var urlRouter = Backbone.Router.extend({
  routes: {
    "": "index",
    "login": "login",
    "reg": "reg",
    "logout": "logout"
  },
  index: function () {
    Session.set("currentUrl", {index: "active", login: "", reg: ""});
  },
  login: function () {
    if (Meteor.userId()) {
      this.navigate("/", true);
      Session.set("info", {success: "", error: "用戶已在線"});
      return;
    }
    Session.set("currentUrl", {index: "", login: "active", reg: ""});
  },
  reg: function () {
    if (Meteor.userId()) {
      this.navigate("/", true);
      Session.set("info", {success: "", error: "用戶已在線"});
      return;
    }
    Session.set("currentUrl", {index: "", login: "", reg: "active"});
  },
  logout: function () {
    if (Meteor.userId()) {
      Meteor.logout();
      this.navigate("/", true);
      Session.set("info", {success: "登出成功", error: ""});
    } else {
      this.navigate("/", true);
      Session.set("info", {success: "", error: "用戶不在線"});
    }
  },
  redirect: function (url) {
    this.navigate(url, true);
  }
});

Router = new urlRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});

Posts = new Meteor.Collection("posts");

Template.index.events({
  'click #submit': function (evt) {
    evt.preventDefault();
    var $post = $("#post").val();
    if ($post.length === 0 || $post.length >= 140) {
      Session.set("info", {success: "", error: "請將內容限定於1～140字"});
      return;
    }
    Posts.insert({user: Meteor.user(), post: $post, time: new Date()}, function (err) {
      if (err) {
        Session.set("info", {success: "", error: err.reason});
      } else {
        Session.set("info", {success: "發表成功", error: ""});
        $("#post").val("");
      }
    });
  }
});

Template.index.posts = function () {
  return Posts.find({}, {sort: {time: -1}});
};