Vue.component('vue-bootstrap-typeahead', VueBootstrapTypeahead)

let app = new Vue({
  el: '#app',
  data: {
    formatOption: [
      {value: 'a4', text: '2 Adressen auf A4'}
    ],
    instituionOptions: [
      {value: 'Q159334', text: 'Weiterführende Schule'},
      {value: 'Q3914', text: 'Schule'},
      {value: 'Q1542966', text: 'Gymnasium'},
      {value: 'Q1302299', text: 'Kinder- und Jugendfreizeiteinrichtung'},
    ],
    placeOfOrigionOptions: [
      {value: 'Q3798', text: 'Flensburg'}
    ],
    selectedFormat: 'a4', // Random
    selectedInstitution: 'Q159334', // Wikidata Object
    selectedRadius: 30, // in KM
    selectedPlaceOfOrigin: {value: 'Q3798', text: 'Flensburg'}, // Wikidata Object
    loadingQuery: false,
    wikiDataAdresses: {},
    query: {},
    labelsGenerated: true,
    sender: {
      activated: false,
      name: 'Chaostreff Flensburg',
      streetHousenumber: 'Apenraderstr. 49',
      zipCodeCity: '24937 Flensburg'
    }
  },
  mounted: async function(){
    await this.loadPlaceOfOriginOptions()
  },
  components: {
      VueBootstrapTypeahead
  },
  methods: {
    voteFor: function(f) {
      f.votes += 1
      this.save()
    },
    addNew: function(event) {
      this.frameworks.push({
        name: event.target.value,
        votes: 0
      })
      event.target.value = ''
      this.save()
    },
    remove: function(f) {
      this.frameworks = this.frameworks.filter(i => i != f)
      this.save()
    },
    load: function() {
      let data = localStorage.getItem('saved')
      if (data) {
        this.frameworks = JSON.parse(data)
      }
    },
    save: function() {
      let data = JSON.stringify(this.frameworks)
      localStorage.setItem('saved', data)
    },
    callWikiData: async function (){
      this.loadingQuery = true;
      const query = `SELECT ?place ?placeLabel ?location ?address ?schueler
      WHERE
      {
        wd:${this.selectedPlaceOfOrigin.value} wdt:P625 ?placeOfOrigionLocation .
        SERVICE wikibase:around {
          ?place wdt:P625 ?location .
          bd:serviceParam wikibase:center ?placeOfOrigionLocation .
        bd:serviceParam wikibase:radius "${this.selectedRadius}" .
        } .
        FILTER EXISTS { ?place wdt:P31 wd:${this.selectedInstitution} } .
        OPTIONAL{?place wdt:P6375 ?address}.   
        OPTIONAL{?place wdt:P2196 ?schueler}.   
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "de" .
        } 
      }`   
      this.wikiDataAdresses = await this.sparkleQuery(query)
      if(this.wikiDataAdresses.results && this.wikiDataAdresses.results.bindings && this.wikiDataAdresses.results.bindings.length > 0) this.labelsGenerated = false
      this.loadingQuery = false;
    },
    sparkleQuery: async function( sparqlQuery ) {
      const endpointUrl = 'https://query.wikidata.org/sparql';
      const fullUrl = endpointUrl  + '?query=' + encodeURIComponent( sparqlQuery );
      console.log('fullUrl', fullUrl)
      const headers = { 'Accept': 'application/sparql-results+json' };

      const result = await fetch( fullUrl, { headers } ).then( body => body.json() );
      return result;
    },
    parseAdress: function(address) {
      return address.replace(',', '<br/>')
    },  
    loadPlaceOfOriginOptions: async function() {
      console.log('loadPlaceOfOriginOptions')
      const data = await fetch("/gemeinen-in-deutschland-wd.json")
        .then(body => body.json())
      this.placeOfOrigionOptions = data.map((gemeinde)=>{
        let obj = {};
        obj['value'] = gemeinde.item.slice(gemeinde.item.search('Q'))
        obj['text'] = gemeinde.itemLabel
        return obj
      })
      .sort((a, b) => (a.text > b.text) ? 1 : -1)
      console.log('done')
      // const locations = require('./gemeinen-in-deutschland-wd.json')
      // console.log(locations.map(location=>console.log(location)))
    },
    printAddressLabels: function() {
      window.print();

    }

  },

})