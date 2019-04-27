class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `#Schulen 30 km um Flensburg

SELECT ?place ?placeLabel ?location
WHERE
{
  # Flensburg coordinates
  wd:Q3798 wdt:P625 ?flensburgLoc .
  SERVICE wikibase:around {
    ?place wdt:P625 ?location .
    bd:serviceParam wikibase:center ?flensburgLoc .
    bd:serviceParam wikibase:radius "30" .
  } .
  # Is an school
  FILTER EXISTS { ?place wdt:P31 wd:Q159334 } .
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "de" .
  } 
}`;

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
queryDispatcher.query( sparqlQuery ).then( (result)=>{
  console.log(result.results.bindings)
  result.results.bindings.forEach((item)=>{
    console.log(item)

    var node = document.createElement("LI");
    var textnode = document.createTextNode(item.placeLabel.value);
    node.appendChild(textnode);
    document.getElementById("myList").appendChild(node)
  })
});