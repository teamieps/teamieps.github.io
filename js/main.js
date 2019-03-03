let jQuery = window.jQuery

const resourcesDatabases = resourcesDatabase

jQuery(document).ready(function () {
  // findUniqueStates()
  setUpUSAMap()
})

let findFesourcesPerState = function () {
  const resourcesPerState = resourcesDatabase.reduce(function (accumulator, currentValue) {
    if (currentValue.State) {
      if (accumulator[currentValue.State.toLowerCase()]) {
        accumulator[currentValue.State.toLowerCase()]++
      } else {
        accumulator[currentValue.State.toLowerCase()] = 1
      }
    }
    return accumulator
  }, {})
  return resourcesPerState
}

let setUpUSAMap = function () {
  const statesWithResources = Object.keys(findFesourcesPerState())
  console.log(statesWithResources)

  let stateColors = {}
  for (let stateCode of statesWithResources) {
    stateColors[stateCode] = '#dcd6ff'
  }

  jQuery('#usa-map').vectorMap({
    map: 'usa_en',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // borderColor: 'rgba(0, 0, 0, 0)',
    borderColor: '#F4F6F6',
    borderOpacity: 1,
    color: '#dfe1e0',
    colors: stateColors,
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

const resourceItemHTML = '<div class="resource-item"><a target="_blank"><h4></h4></a><p class="resource-description"></p></div>'

const displayResources = function (stateCode) {
  const selectedStateCode = stateCode.toUpperCase(stateCode)
  const selectedStateName = statesDatabase[selectedStateCode]
  jQuery('#state-name').text(selectedStateName)

  const filteredResources = resourcesDatabase.filter(entry => entry.State === selectedStateCode)

  // Delete existing elements
  jQuery('#resources-list').empty()

  for (let resource of filteredResources) {
    let resourceNode = jQuery(resourceItemHTML)
    resourceNode.find('a').attr('href', resource['Website'])
    resourceNode.find('h4').text(resource['Organization Name'])
    resourceNode.find('.resource-description').text(resource['Brief Description'])

    jQuery('#resources-list').append(resourceNode)
  }

  console.log(filteredResources)
}
