function makeSPARQLQuery( endpointUrl, sparqlQuery, doneCallback ) {
	var settings = {
		headers: { Accept: 'application/sparql-results+json' },
		data: { query: sparqlQuery }
	};
	return $.ajax( endpointUrl, settings ).then( doneCallback );
}

$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null) {
     return null;
  }
  return decodeURI(results[1]) || 0;
}

if($.urlParam('km')){    
  var endpointUrl = 'https://query.wikidata.org/sparql',
  sparqlQuery = "#Schulen 30 km um Flensburg\n" +
  "\n" +
  "SELECT ?place ?placeLabel ?location ?address ?schueler\n" +
  "WHERE\n" +
  "{\n" +
  "  # Flensburg coordinates\n" +
  "  wd:Q3798 wdt:P625 ?flensburgLoc .\n" +
  "  SERVICE wikibase:around {\n" +
  "    ?place wdt:P625 ?location .\n" +
  "    bd:serviceParam wikibase:center ?flensburgLoc .\n" +
  "    bd:serviceParam wikibase:radius \"+"+$.urlParam('km')+"\" .\n" +
  "  } .\n" +
  "  # Is an school\n" +
  "  FILTER EXISTS { ?place wdt:P31 wd:Q159334 } .\n" +
  "  OPTIONAL{?place wdt:P6375 ?address}.   \n" +
  "  OPTIONAL{?place wdt:P2196 ?schueler}.   \n" +
  "  SERVICE wikibase:label {\n" +
  "    bd:serviceParam wikibase:language \"de\" .\n" +
  "  } \n" +
  "}";    
makeSPARQLQuery( endpointUrl, sparqlQuery, function( data ) {
    data.results.bindings.forEach(element => {
    $("form").css("display", "none");

      $( 'body' ).append( $( '<div class="label">' ).html( 
        '<div class="sender"> <div class="name">Chaostreff Flensburg e.V.</div>'+
        "Apenrader Str. 49, 24937 Flensburg".replace(',', '<br/>') +
        '</div>'+
        '<div class="empfaenger">'+
        '<span class="name">'+
        element.placeLabel.value + 
        '</span>'+
        element.address.value.replace(',', '<br/>') +
        '</div>'
      ));
    });
    }
);
  }
