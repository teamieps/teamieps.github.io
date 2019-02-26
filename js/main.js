let jQuery = window.jQuery

jQuery(document).ready(function () {
  setUpUSAMap()
  console.log(database)
})

let setUpUSAMap = function () {
  jQuery('#usa-map').vectorMap({
    map: 'usa_en',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderColor: '#f3f6f6',
    color: '#dfe1e0',
    borderWidth: 10,
    enableZoom: false,
    showTooltip: true,
    selectedColor: '#acadfe',
    hoverColor: '#acadfe',
    onRegionSelect: function (event, code, region) {
      console.log(event, code, region)
      window.alert('You selected ' + code)
    }

  })
}
