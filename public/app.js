var _stateData = {
  messages: []
};
Vue.component('entry-form', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  props: ['side'],
  data: function(){return {
      text: '',
      name: ''
    }
  },
  template: $("#editor-template").html(),
  methods: {
    save: function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var context = this;
      var msg = {
        side: this.side,
        text: this.text,
        name: this.name
      }
      var jq = $.post("/messages", {message: msg} ,function(){
        console.log("saved");
        msg.timestamp = moment().format();
        _stateData.messages.push(msg);
      });
        
    }
  }
});

Vue.component('message-list', {
  props: ['list', 'side'],
  template: $("#list-template").html(),
  methods: {
    relativize: function(timestamp) {
      return moment(timestamp).fromNow();
    }
  }
});

var app = new Vue({
  el: '#app',
  data: _stateData,
  computed: {
    redMessages: function() {
      var list = this.messages.filter(function(obj){
          return obj.side == "red";
      });
      list = _.sortBy(list, function(o){
        return -Date.parse(o.timestamp);
      });
      return list;
    },
    blueMessages: function() {
      var list = this.messages.filter(function(obj){
          return obj.side == "blue";
      });
      list = _.sortBy(list, function(o){
        return -Date.parse(o.timestamp);
      });
      return list;
    }
  },
  created: function() {
    var context = this;
    $.get('/messages')
     .done(function(res){
       _stateData.messages = res;
     });
  }
});
