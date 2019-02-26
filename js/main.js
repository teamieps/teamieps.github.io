let jQuery = window.jQuery

jQuery(document).ready(function () {
  setUpUSAMap()
  console.log(database)
})

let setUpUSAMap = function () {
  jQuery('#usa-map').vectorMap({
    map: 'usa_en',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // borderColor: 'rgba(0, 0, 0, 0)',
    borderColor: '#F4F6F6',
    borderOpacity: 1,
    color: '#dfe1e0',
    borderWidth: 2,
    enableZoom: false,
    // showLabels: true,
    showTooltip: true,
    selectedColor: '#acadfe',
    hoverColor: '#acadfe',
    onRegionSelect: function (event, code, region) {
      displayResources(code)
    }

  })
}

const displayResources = function (stateCode) {
  const selectedStateCode = stateCode.toUpperCase(stateCode)
  const selectedStateName = states[selectedStateCode]
  jQuery('#state-name').text(selectedStateName)
}
