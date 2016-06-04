(function() {

	var requiredCategories = [ "airport", "amusement_park", "aquarium",
			"art_gallery", "bakery", "bar", "bowling_alley", "bus_station",
			"cafe", "campground", "casino", "cemetery", "church", "city_hall",
			"convenience_store", "courthouse", "department_store", "embassy",
			"florist", "food (deprecated)", "funeral_home",
			"grocery_or_supermarket", "health (deprecated)", "hindu_temple",
			"jewelry_store", "library", "local_government_office", "lodging",
			"meal_delivery", "meal_takeaway", "mosque", "movie_theater",
			"moving_company", "museum", "night_club", "park", "parking",
			"pharmacy", "physiotherapist", "place_of_worship (deprecated)",
			"post_office", "real_estate_agency", "restaurant", "rv_park",
			"school", "shopping_mall", "spa", "stadium", "storage", "store",
			"subway_station", "synagogue", "taxi_stand", "train_station",
			"transit_station", "travel_agency", "university",
			"veterinary_care", "zoo" ];

	var notRequiredTypes = [ "accounting", "atm", "bakery", "bank",
			"beauty_salon", "bicycle_store", "book_store", "car_dealer",
			"car_rental", "car_repair", "car_wash", "clothing_store",
			"dentist", "doctor", "electrician", "electronics_store",
			"fire_station", "florist", "funeral_home", "furniture_store",
			"gas_station", , "gym", "hair_care", "hardware_store",
			"health (deprecated)", "home_goods_store", "hospital",
			"insurance_agency", "laundry", "lawyer", "liquor_store",
			"locksmith", "lodging", "movie_rental", "painter", "pet_store",
			"pharmacy", "physiotherapist", "plumber", "police",
			"real_estate_agency", "roofing_contractor" ];

	var notRequiredTypesArrayHash = {};
	for (var i = 0; i < notRequiredTypes.length; i++) {
		notRequiredTypesArrayHash[requiredCategories[i]] = "E";
	}

	var autocompleteService = new google.maps.places.AutocompleteService();
	var placesService = new google.maps.places.PlacesService($('<div />')[0]);
	var predictionsOld;

	function PlacesSearch(element, options) {

		this.element = $(element);
		this.options = $.extend({}, options);
		this.onSelectAddress = this.options.onSelectAddress || $.noop;
		this.map = this.options.map;

		this.element .typeahead( { highlight : true },
						{
							source : this.places,
							name : "States",
							async : true,
							hint : true,
							minLength : 3,
							templates : {
								empty : [ '<div class="empty-message">',
										'No Match Found', '</div>' ].join('\n'),
								footer : Handlebars
										.compile("<span style= 'padding-top:2px ;float: right;  padding-right: 12px;'> "
												+ "	<image style='width: 120px;' src='//triplived.com/static/triplived/img/powered_by_google_on_white_hdpi.png' />"
												+ " </span>")
							}
						});
		var obj = this;
		this.element.on('typeahead:selected', function(e, address) {
			obj.typeaheadSelectedItem(e, address);
		});
	};

	/**
	 * Extending the Method
	 */
	PlacesSearch.prototype = {
		constructor : PlacesSearch,
		/**
		 * This will help in getting places data from google web services
		 * @param q
		 * @param cb  : sync
		 * @param fc  : async   : see typeahead documentations for this
		 */
		places : function(q, cb, fc) {
			var c = new Array();
			c.push('');
			autocompleteService.getPlacePredictions({ input : q }, function(predictions, status) {

				if (status == google.maps.places.PlacesServiceStatus.OK) {
					predictionsOld = predictions;

					$.map(predictions, function(prediction) {
						c.push(prediction.description);
					});
					fc(c);
				}
			});
		},
		/**
		 * When and item get selected we need to pull its detail from google
		 * 
		 * @param e
		 * @param address
		 */
		typeaheadSelectedItem : function(e, address) {

			var obj = this;
			var reference = $.grep(predictionsOld, function(prediction) {
				return prediction.description === address;
			})[0].reference;

			placesService.getDetails({ reference : reference }, function(result, status) {
				obj.obtainPlaceDetail(result, status);
			});
		},
		/**
		 * Callback for Obtaining place detail from google
		 * 
		 * @param result
		 * @param status
		 */
		obtainPlaceDetail : function(result, status) {

			this.map.setCenter(result.geometry.location);
			this.map.setZoom(9);

			var map = this.map;
			var image = {
				url : 'http://www.triplived.com/static/timeline/explore/Backpacking/1m.jpg',
				scaledSize : new google.maps.Size(100, 100)
			};

			var marker = new google.maps.Marker({
				position : {
					lat : result.geometry.location.lat(),
					lng : result.geometry.location.lng()
				},
				map : map,
				icon : image

			});

			var url = 'http://www.triplived.com/static/timeline/explore/Backpacking/1m.jpg';

			var infoWindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, "click", function() {
				infoWindow.setContent("<h1>Marker </h1><img src=" + url + " />");
				infoWindow.open(map, this);
			});
		}
	};

	/**
	 * STARTER
	 */
	$.fn.placesSearch = function(options) {
		return this.each(function() {
			new PlacesSearch(this, options);
		});
	};
	
}());
