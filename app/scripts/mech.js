/////////////////
/* Generic gui */
/////////////////

var toast = function(msg){
  $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
  .css({ display: "block", 
    opacity: 0.80, 
    position: "fixed",
    padding: "7px",
    "text-align": "center",
    "background": "white",
    width: "270px",
    left: ($(window).width() - 284)/2,
    top: $(window).height()/4 * 3 })
  .appendTo( $.mobile.pageContainer ).delay( 1500 )
  .fadeOut( 400, function(){
    $(this).remove();
  });
}
//////////////////////////////
/* Generic Number Crunching */
//////////////////////////////
function mechcrunch_total_armor(mech){
  return mech.armor["head"] + 
    mech.armor["center-torso"] + 
    mech.armor["left-torso"] + 
    mech.armor["right-torso"] + 
    mech.armor["left-leg"] + 
    mech.armor["right-leg"] + 
    mech.armor["left-arm"] + 
    mech.armor["right-arm"] + 
    mech.armor["center-torso-rear"] + 
    mech.armor["left-torso-rear"] + 
    mech.armor["right-torso-rear"];
}

function mechcrunch_total_structure(mech){
  return mech.structure["head"] + 
    mech.structure["center-torso"] + 
    mech.structure["left-torso"] + 
    mech.structure["right-torso"] + 
    mech.structure["left-leg"] + 
    mech.structure["right-leg"] + 
    mech.structure["left-arm"] + 
    mech.structure["right-arm"];
}
/////////////////////////////////////
/* Generic functions to load mechs */
/////////////////////////////////////

function mechloader_get_manifest(cb) {
  $.getJSON("resources/manifest.json", function (data) {
    if (cb) {
      cb(data);
    }
  });
}

function mechloader_get_mech(path, cb) {
  $.getJSON("resources/" + path, function (data){
    if (cb) {
      cb(data);
    }
  });
}

function mechloader_populate_storage(cb){
  console.log("Downloading Mechs");
  mechloader_get_manifest(function (mechs_paths) {
    localStorage.setItem("mechs_paths", JSON.stringify(mechs_paths)); // save mechs to local storage
    var mechs = [];
    mechs_paths.forEach(function (path) {
      mechloader_get_mech(path, function (mech) { // get specific mech
        mechs.push(mech);
        if(mechs.length == mechs_paths.length){
          localStorage.setItem("mechs",JSON.stringify(mechs));
          if(cb){
            cb();
          }
        }
      })
    });
  });
}

/////////////////////////
/* Functions for index */
/////////////////////////
function index_reload_data(){
  mechloader_populate_storage(function() {
    toast("Reloaded");
  });
}

/////////////////////////////
/* Functions for list.html */
/////////////////////////////

function lists_get(){ // gets the list from localStorage
  var lists = JSON.parse(localStorage.getItem("mech-lists"));
  
  if(lists == null){
    lists = [];
    localStorage.setItem("mech-lists",JSON.stringify(lists));
  }

  return lists;
}

function lists_set(lists){ //saves the list to localStorage
  localStorage.setItem("mech-lists",JSON.stringify(lists));
}


function list_active_set(list){ //saves the active list to localStorage
  localStorage.setItem("mech-active-list",JSON.stringify(list));
}

function list_active_get(){ //gets the active list from localStorage
  var list = JSON.parse(localStorage.getItem("mech-active-list"));
  if(list != null)
    return list;
  return [];
}


function list_create(){ // called from the create list form. Creates a new list and saves it to localStorage
  var name = $("#create-list-page #list-name").val();

  var lists = lists_get();
  lists.push({"name":name,"mechs":[]});
  lists_set(lists);

  list_update();
}

function list_update(){ //updates the gui for the list page
  console.log("Updating List Page");

  var lists = lists_get();

  $("#list-select #lists .list").remove();
  lists.forEach(function (list) {
    var left = "<a href='list-view.html'>";
    var right = "</a>";

    $("#list-select #lists .list-template")
      .clone()
      .appendTo("#lists")
      .removeClass("list-template")
      .addClass("list")
      .removeClass("hidden")
      .html(left + list.name + right)
      .click(function(){
        console.log("Clicked! " + list.name);
          list_active_set(list);
      });
  });
}

///////////////////////////////
/* Functions for the catalog */
///////////////////////////////

function catalog_populate() {
  console.log("populating catalog");
  // clear all mechs from the catalog
  $(".catalog-item").remove();

  // get mechs from localstorage
  var mechs = JSON.parse(localStorage.getItem("mechs"));
  
  // iterate over all of the mechs and append them to the gui
  mechs.forEach(function (mech) {
    var left = "<a href='catalog-item.html'>";
    var right = "</a>";
    $("#catalog .catalog-item-template") 
      .clone()
      .appendTo($("#catalog-container")) // append to the end of the catalog
      .removeClass("catalog-item-template") // remove template class so multiple duplications wont happen
      .addClass("catalog-item") // add class to make it considered a regular row
      .removeClass("hidden")
      .html(left + mech.name + right)
      .click(function(){
        localStorage.setItem("catalog-item-mech", JSON.stringify(mech));
        localStorage.setItem("is-catalog-item", true); //to know if status information should attempt to be displayed
    });
  });
}

////////////////////////////////
/* Functions for catalog item */
////////////////////////////////
function catalog_item_update(){ // called directly from catalog-item.html page
  var mech = JSON.parse(localStorage.getItem("catalog-item-mech"));
  
  //general values
  $("#catalog-item .mech-name").text(mech.name);
  $("#catalog-item .mech-tonnage").text(mech.tonnage);
  $("#catalog-item .mech-cost").text(mech.cost);
  $("#catalog-item .mech-total-armor").text(mechcrunch_total_armor(mech));
  $("#catalog-item .mech-total-structure").text(mechcrunch_total_structure(mech));

  //movement speeds
  $("#catalog-item .mech-speed-walk").text(mech.movement[0]);
  $("#catalog-item .mech-speed-run").text(mech.movement[1]);
  $("#catalog-item .mech-speed-jump").text(mech.movement[2]);
  
  //general armor values
  $("#catalog-item .mech-armor-head").text(mech.armor.head);
  $("#catalog-item .mech-armor-center-torso").text(mech.armor["center-torso"]);
  $("#catalog-item .mech-armor-left-torso").text(mech.armor["left-torso"]);
  $("#catalog-item .mech-armor-right-torso").text(mech.armor["right-torso"]);
  $("#catalog-item .mech-armor-left-leg").text(mech.armor["left-leg"]);
  $("#catalog-item .mech-armor-right-leg").text(mech.armor["right-leg"]);
  $("#catalog-item .mech-armor-left-arm").text(mech.armor["left-arm"]);
  $("#catalog-item .mech-armor-right-arm").text(mech.armor["right-arm"]);
  $("#catalog-item .mech-armor-center-torso-rear").text(mech.armor["center-torso"]);
  $("#catalog-item .mech-armor-left-torso-rear ").text(mech.armor["left-torso-rear"]);
  $("#catalog-item .mech-armor-right-torso-rear").text(mech.armor["right-torso-rear"]);

  //structure values
  $("#catalog-item .mech-structure-head").text(mech.structure["head"]);
  $("#catalog-item .mech-structure-center-torso").text(mech.structure["center-torso"]);
  $("#catalog-item .mech-structure-left-torso").text(mech.structure["left-torso"]);
  $("#catalog-item .mech-structure-right-torso").text(mech.structure["right-torso"]);
  $("#catalog-item .mech-structure-left-leg").text(mech.structure["left-leg"]);
  $("#catalog-item .mech-structure-right-leg").text(mech.structure["right-leg"]);
  $("#catalog-item .mech-structure-left-arm").text(mech.structure["left-arm"]);
  $("#catalog-item .mech-structure-right-arm").text(mech.structure["right-arm"]);

  //weapons
  $("#catalog-item .mech-weapon").remove(); // remove previous weapons
  mech.weapons.forEach(function (weapon){ // iterates over all weapons
    $("#catalog-item .mech-weapon-template")
      .clone() // clones the hidden weapon template
      .appendTo("#mech-weapons") //places weapon template in dom
      .removeClass("mech-weapon-template") //removes template class
      .addClass("mech-weapon") // adds mech-weapon class
      .removeClass("hidden") // makes it visible
      .text(weapon.name + " - " + weapon.location);
  });

  $("#catalog-item .mech-heatsinks").text(mech.heatsinks);

  //crits
  var crits = ["head","center-torso","left-torso","right-torso","left-arm","right-arm","left-leg","right-leg"];
  crits.forEach(function (crit){//programatically handle all crits
    $("#catalog-item .mech-crit-" + crit).remove(); // remove all previous crits
    
    for (var i = 0; i < mech.crits[crit].length; i++) {
      if(!Array.isArray(mech.crits[crit][i])){
       $("#catalog-item .mech-crit-" + crit + "-template")
          .clone()
          .appendTo("#catalog-item #mech-crits-" + crit)
          .removeClass("mech-crit-" + crit + "-template")
          .addClass("mech-crit-" + crit)
          .removeClass("hidden")
          .text((i+1) + " - " + mech.crits[crit][i]);
      } else {
        for (var j = 0; j < 6; j++) {          
          $("#catalog-item .mech-crit-" + crit + "-template")
            .clone()
            .appendTo("#catalog-item #mech-crits-" + crit)
            .removeClass("mech-crit-" + crit + "-template")
            .addClass("mech-crit-" + crit)
            .removeClass("hidden")
            .text((j+1) + " - " + mech.crits[crit][i][j]);
        };
        $("<hr/>").appendTo("#catalog-item #mech-crits-" + crit);
      }
    };
  });
}

//////////////////
/* On Page Load */
//////////////////

$(document).ready(function(){
  mechloader_populate_storage(); // load mechs to localstorage
});
