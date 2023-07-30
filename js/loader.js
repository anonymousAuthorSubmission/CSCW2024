/* Set up the initial map center and zoom level */
var map = L.map("map", {
  center: [42.575404, 1.33538], // EDIT coordinates to re-center map
  zoom: 5, // EDIT from 1 (zoomed out) to 18 (zoomed in)
  maxZoom: 18,
  scrollWheelZoom: true,
  closePopupOnClick: true,
  boxZoom: true,
  dragging: true,
});

/* display basemap tiles -- see others at https://leaflet-extras.github.io/leaflet-providers/preview/ */
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">\
          OpenStreetMap</a> contributors, &copy;\
          <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(map);

var markers = L.markerClusterGroup();

const storyNodes = [];
const mediaNodes = [];

$.getJSON("data/contentJSON.json", function (gData_json) {
  for (var i in gData_json) {
    storyNodes.push(gData_json[i]);
  }
  LoadMediaNodes();
});

function LoadMediaNodes() {
  $.getJSON("data/mediaJSON.json", function (gData_json) {
    for (var i in gData_json) {
      mediaNodes.push(gData_json[i]);
    }
    SetupNodes();
  });
}

function SetupNodes() {
  for (var i in storyNodes) {
    var id = storyNodes[i]["storyID"];
    var title = storyNodes[i]["storytitle"];
    var content = title;
    //  '<button class="button is-primary" data-show="quickview" data-target="quickviewDefault">Show quickview</button>';
    var marker = L.marker(
      new L.LatLng(
        storyNodes[i]["storyLatitude"],
        storyNodes[i]["storyLongitude"]
      ),
      { id: id }
    );
    marker.bindTooltip(title, { direction: "auto" });
    marker.bindPopup(content).on("click", function (arg) {
      clickedID = arg.target.options.id;

      ClearDraw();

      node = storyNodes.filter((node) => node.storyID === clickedID)[0];
      mediaNodeConnectedStory = mediaNodes.filter(
        (node) => node.storyID === clickedID
      );

      $(".storyTitle").html("<i>" + node["storytitle"] + "</i>");

      $(".storySubtitle").text("by " + node["participantID"]);
      $(".storyText").html(node["storyContent"]);

      var counter = 0;

      for (var j in mediaNodeConnectedStory) {
        if (
          mediaNodeConnectedStory[j]["mediaType"] == "cover" ||
          mediaNodeConnectedStory[j]["mediaType"] == "image" ||
          mediaNodeConnectedStory[j]["mediaType"] == "imageKG"
        ) {
          var div = document.createElement("li");
          var itemN = parseInt(j) + 1;
          div.className = "splide__slide";

          var img = document.createElement("img");
          img.src = mediaNodeConnectedStory[j]["mediaLocation"];
          img.className = "storyImage";

          div.appendChild(img);

          splide.add(div);
          counter++;
        }
      }
      // if (counter >= 1) {
      //   console.log("counter: " + counter);
      // }
      $(".drawer").drawer("open");

      setTimeout(function () {
        $(".drawer").drawer()[0].iScroll.refresh();
        $(".drawer").drawer()[0].iScroll.scrollTo(0, 0);
      }, 300);

    });
    markers.addLayer(marker);
  }
  map.addLayer(markers);
}

function ClearDraw() {
  $(".drawer").drawer("close");
  $(".storyImage").attr("src", ``);
  $(".storyTitle").text("");
  $(".storySubtitle").text("");
  $(".storyText").text("");

 splide.remove( Slide => Slide.index % 1 === 0 );
}

var splide = new Splide(".splide", {
  perPage: 1,
  autoWidth: true,
  lazyLoad: "nearby",
});

splide.mount();

map.on('resize', function(ev) {
  map.invalidateSize();
});

$("#map").height($(window).height()).width($(window).width());
//map.invalidateSize();


