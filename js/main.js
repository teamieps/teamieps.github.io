let jQuery = window.jQuery

const resourcesDatabases = resourcesDatabase

jQuery(document).ready(function () {
  // findUniqueStates()
  setUpUSAMap()
  populateStateSelectionDropdown()
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

let populateStateSelectionDropdown = function () {
  const statesCodesWithResources = Object.keys(findFesourcesPerState())
  let selectElement = document.getElementById('stateSelectionDropdown')

  const statesWithResources = statesCodesWithResources.map(function (stateCode) {
    return {
      stateCode: stateCode.toLowerCase(),
      stateName: statesDatabase[stateCode.toUpperCase()]
    }
  })

  // sort states by name
  statesWithResources.sort(function (a, b) {
    var nameA = a.stateName.toUpperCase() // ignore upper and lowercase
    var nameB = b.stateName.toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })

  for (let state of statesWithResources) {
    let newOption = document.createElement('option')
    newOption.value = state.stateCode
    newOption.label = state.stateName
    newOption.innerHTML = state.stateName
    selectElement.appendChild(newOption)
  }
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
    onRegionClick: ignoreUnsupportedStates,
    onRegionSelect: function (event, code, region) {
      if (jQuery('#stateSelectionDropdown').val() !== code) {
        jQuery('#stateSelectionDropdown').val(code)
      }
      displayResources(code)
    },
    onRegionOver: ignoreUnsupportedStates,
    onLabelShow: function (event, label, code) {
      return ignoreUnsupportedStates(event, code)
    }
  })
}

const statesWithResources = Object.keys(findFesourcesPerState())
const ignoreUnsupportedStates = function (event, code, region) {
  if (!statesWithResources.includes(code)) {
    event.preventDefault()
  }
}

jQuery('#stateSelectionDropdown').change(function (event) {
  const selectedState = jQuery('#stateSelectionDropdown').val()
  jQuery('#jqvmap1_' + selectedState).click()
})

// const resourceItemHTML = '<div class="resource-item"><a target="_blank"><h3></h3></a><div class="tags"></div><p class="resource-description"></p></div>'
const resourceItemHTML = '<div class="resource-item"><a target="_blank"><h3></h3></a><div class="tags"></div><p class="resource-description"></p><div><label class="resource-details-toggle-label purple-background">Show Details</label></div><input type="checkbox" class="resource-details-toggle"><div class="resource-details"></div></div>'

const displayResources = function (stateCode) {
  const selectedStateCode = stateCode.toUpperCase(stateCode)
  const selectedStateName = statesDatabase[selectedStateCode]
  jQuery('#state-name').text(selectedStateName)

  const filteredResources = resourcesDatabase.filter(entry => entry.State === selectedStateCode)

  // Delete existing elements
  jQuery('#resources-list').empty()

  for (let resource of filteredResources) {
    const thisResourceID = Math.random()
    let resourceNode = jQuery(resourceItemHTML)
    resourceNode.find('a').attr('href', resource['Website'].trim())
    resourceNode.find('h3').text(resource['Organization Name'].trim())
    resourceNode.find('.resource-description').text(resource['Brief Description'].trim())

    // Construct Details Expansion

    // const detailsComponents = [resource['Address'], resource['Phone Number'], resource['Email']]

    // detailsComponents.map(s => s.trim()).filter(s => s.length > 0)

    const resourceDetailsElements = []

    if (resource['Website'].trim().length > 0) {
      console.log(resource['Website'].match(/(https*:\/\/|^)([a-zA-Z0-9-.]+)/))
      resourceDetailsElements.push(`<a href="${resource['Website']}" target="_blank">${resource['Website'].match(/(https*:\/\/|^)([a-zA-Z0-9-.]+)/)[2]}</a>`)
    }

    // The substituted value will be contained in the result variable
    const rawAddress = resource['Address'].trim()
    if (rawAddress.length > 0) {
      resourceDetailsElements.push(`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawAddress)}" target="_blank">${resource['Address'].trim().replace(/(\n|\n)/g, `<br>`)}</a>`)
    }

    // Parse and format phone numbers
    const phoneNumbers = resource['Phone Number'].trim().replace(/(\.|-)/g, '').match(/\d{9,}/g) || []
    const phoneNumbersHTML = phoneNumbers.sort().map(number => `<a href="tel:+1${number}" title="Call this resource">${number.replace(/1?(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</a>`).join(', ')
    if (phoneNumbers.length > 0) {
      resourceDetailsElements.push(phoneNumbersHTML)
    }

    const resourceDetailsHTML = resourceDetailsElements.join('<br>')

    resourceNode.find('.resource-details').html(resourceDetailsHTML)

    // Configure checkbox
    resourceNode.find('[type="checkbox"]').attr('id', thisResourceID + 'checkbox')
    resourceNode.find('label').attr('for', thisResourceID + 'checkbox')

    // Configure tags
    if (resource['Tags'].length > 0) {
      const tags = resource['Tags'].split(',').map(rawTag => rawTag.trim())
      const tagContainer = resourceNode.find('.tags')
      for (let tag of tags) {
        tagContainer.append(jQuery(`<span class="tag purple-background">${tag}</span>`))
      }
    }

    jQuery('#resources-list').append(resourceNode)
  }

  console.log(filteredResources)
}
