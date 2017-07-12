var map;
var sportsClubs=[];
var mapCenter={lat: 30.0444, lng: 31.2357};
var infowindow;
/**
* Intialize Map div with Google Maps
*/
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter,
		zoom: 10
	});
	infowindow = new google.maps.InfoWindow();
	google.maps.event.trigger(map, "resize");
	getSportsClubs();	
}
/**
* get all sports clubs from foursquare
*/
function getSportsClubs(){
    $.ajax({
    	url:"https://api.foursquare.com/v2/venues/search?",
        dataType:"json",
        data:{
        	client_id: "YNDU5NPUGZCBGH5KM4RG5HVXNIWRN4WBL3CSY1KRZC0Q1X0C",
            client_secret: "KNPQ1QPT41WFFZUF5BPCRSZL11IJHQA5BV40FUFZYPNH2M54",	                
            v: 20170712,
            ll: mapCenter.lat+","+mapCenter.lng,
            query:"Sports Club",
            limit:20
        },
		success: function(json) {
			json.response.venues.forEach(function(club){
				sportsClubs.push({id:club.id,name:club.name,lat:club.location.lat,lng:club.location.lng});						
			});
			ko.applyBindings(new viewModel());
    	},
    	error: function(){
    		alert('Error.... No Data available, Check your connection!!');
    	}
    });

}
/**
* Represent Club Marker Object
* @param {Object} Club - contain id,name,lat,lng
*/
var ClubMarker = function(club){
	var self = this;
	this.id=club.id;
	this.name=club.name;
	this.position ={lat:club.lat,lng:club.lng};

	this.marker = new google.maps.Marker({
            position: self.position,
            title: self.name,
            map: map
        });
	/**
	* click listener on each market 
	*/
    this.marker.addListener('click', function() {
        animateBounce();
        displayInfoWindow();
    });

	/**
	* animate cliked marker
	*/
    function animateBounce () {
        self.marker.setAnimation(google.maps.Animation.BOUNCE);    
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1000);
    }
	/**
	* display Info window
	*/
    function displayInfoWindow(){
	    infowindow.close();
	    $.ajax({
	    	url:"https://api.foursquare.com/v2/venues/"+self.id,
	        dataType:"json",
	        data:{
	        	client_id: "YNDU5NPUGZCBGH5KM4RG5HVXNIWRN4WBL3CSY1KRZC0Q1X0C",
	            client_secret: "KNPQ1QPT41WFFZUF5BPCRSZL11IJHQA5BV40FUFZYPNH2M54",	                
	            v: 20170712,
	        },
			success: function(json) {					
	            infowindow.setContent('<p> <h2>' + self.name + '</h1></p>' + '<p><a href="'+json.response.venue.shortUrl+'">'+ json.response.venue.shortUrl +'</a></p>');
	            infowindow.open(map, self.marker);
	    	},
	    	error: function(){
	    		 infowindow.setContent('<p> Error... no data</p>');
	    		 infowindow.open(map, self.marker);	
	    	}
	    });
            
    }



	this.triggerClick = function(curMarker){
        google.maps.event.trigger(curMarker.marker, 'click');
	};

};
/**
* Represent ViewModel object that contain the list,markers and search query
*/
var viewModel = function(){
	var self = this;
	self.markers = ko.observableArray([]);
	sportsClubs.forEach(function(club){
		self.markers.push(new ClubMarker(club));
	});
	this.filter = ko.observable('');
	this.filteredMarkers = ko.computed(function() {
		var searchStr = self.filter().toLowerCase();
	    if (!searchStr) {      
	        self.markers().forEach(function(marker){
	        marker.marker.setVisible(true);
	      });
	      return self.markers();
	    } else {
	      return ko.utils.arrayFilter(self.markers(), function(marker) {
	        var string = marker.marker.title.toLowerCase();
	        var res =  (string.search(searchStr) >= 0);
	        marker.marker.setVisible(res);
	        return res;
	      });
	    }
	});
};
/**
* fired incase of error in google map
*/
function googleMapError(){
    alert("Error in Google Maps...!!");
}