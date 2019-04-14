let jQuery = window.jQuery

const resourcesDatabases = resourcesDatabase
let userPosition
let resourcesFilter = {}

jQuery(document).ready(function () {
  // findUniqueStates()
  setUpUSAMap()
  populateStateSelectionDropdown()
  populateResourceCategoriesList()
})

// checked items are jQuery('#categories-list input:checked').toArray().map(item => $(item).attr('id'))

jQuery('#categories-list').on('change', 'input', function (event) {
  const selectedCategories = jQuery('#categories-list input:checked').toArray().map(item => jQuery(item).attr('id'))

  if (selectedCategories.length > 0) {
    resourcesFilter.categories = selectedCategories
  } else {
    delete resourcesFilter.categories
  }

  const resources = prepareResources(resourcesFilter)
  displayResources(resources)
})

// Populate the list of resource categories
let populateResourceCategoriesList = function () {
  const categoriesObject = {}
  for (let thisResource of resourcesDatabase) {
    let thisResourceCategories = thisResource.Tags.trim().split(', ')
    thisResourceCategories = thisResourceCategories.map(cat => cat.trim().toLowerCase())
    thisResource.CleanedTags = thisResourceCategories.map(cat => cat.split(' ').join(''))
    for (let thisCategory of thisResourceCategories) {
      if (thisCategory.length > 0) {
        if (categoriesObject[thisCategory]) {
          categoriesObject[thisCategory]++
        } else {
          categoriesObject[thisCategory] = 1
        }
      }
    }
  }

  const categoriesArray = Object.keys(categoriesObject).map(function (category) {
    return {
      name: category,
      count: categoriesObject[category]
    }
  }).sort(function (a, b) {
    if (a.count < b.count) {
      return -1
    }
    if (a.count > b.count) {
      return 1
    }
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  }).reverse()

  const categoriesListElement = $('#categories-list')
  for (let thisCategory of categoriesArray) {
    const thisCategoryShortName = thisCategory.name.split(' ').join('')
    const thisCategoryHTML = `<li><input type='checkbox' id='${thisCategoryShortName}'><label for='${thisCategoryShortName}'>${thisCategory.name} (${thisCategory.count})</label></li>`
    categoriesListElement.append(thisCategoryHTML)
  }
}

let findResourcesPerState = function () {
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
  const statesCodesWithResources = Object.keys(findResourcesPerState())
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
  const statesWithResources = Object.keys(findResourcesPerState())

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
      resourcesFilter.state = code
      const resources = prepareResources(resourcesFilter)
      displayResources(resources)
    },
    onRegionDeselect: function () {
      jQuery('#stateSelectionDropdown').val('select-a-state')
      delete resourcesFilter.state
      console.log(resourcesFilter)
      const resources = prepareResources(resourcesFilter)
      displayResources(resources)
    },
    onRegionOver: ignoreUnsupportedStates,
    onLabelShow: function (event, label, code) {
      return ignoreUnsupportedStates(event, code)
    }
  })
}

const statesWithResources = Object.keys(findResourcesPerState())
const ignoreUnsupportedStates = function (event, code, region) {
  if (!statesWithResources.includes(code)) {
    event.preventDefault()
  }
}

jQuery('#stateSelectionDropdown').change(function (event) {
  const selectedState = jQuery('#stateSelectionDropdown').val()

  switch (selectedState) {
    case 'select-a-state':
      console.log('select-a-state')
      jQuery('#jqvmap1_nj').click()
      jQuery('#jqvmap1_ca').click()
      jQuery('#jqvmap1_ca').click()
      break
    default:
      jQuery('#jqvmap1_' + selectedState).click()
  }
})

const resourceItemHTML = '<div class="resource-item"><a target="_blank"><h3></h3></a><div class="tags"></div><p class="resource-description"></p><div><label class="resource-details-toggle-label purple-background">Show Details</label></div><input type="checkbox" class="resource-details-toggle"><div class="resource-details"></div></div>'

jQuery('.find-resources-trigger').click(function () {
  const clickTarget = $(this)
  const originalText = $(this).text()
  $(this).text('Searching for resources near you…')
  findUserPosition(function () {
    clickTarget.text(originalText)

    // Animate
    jQuery([document.documentElement, document.body]).animate({
      scrollTop: jQuery('#resources-display').offset().top - 150
    }, 500)

    // Update resources
    const resources = prepareResources(resourcesFilter)
    displayResources(resources)
  })
})

const prepareResources = function (filter) {
  let filteredResources = resourcesDatabase

  // Apply state filter
  if (filter && filter.state) {
    const selectedStateCode = filter.state.toUpperCase()
    filteredResources = resourcesDatabase.filter(entry => entry.State === selectedStateCode)
  }

  // Apply categories filter
  if (filter && filter.categories && filter.categories.length > 0) {
    filteredResources = filteredResources.filter(function (entry) {
      if (!entry.CleanedTags || entry.CleanedTags.length === 0) {
        return false
      }

      return filter.categories.some(function (thisCategory) {
        console.log(thisCategory, entry.CleanedTags)
        return (entry.CleanedTags.indexOf(thisCategory) > -1)
      })
    })
  }

  // Add distance information
  filteredResources = filteredResources.map(function (thisResource) {
    thisResource.Distance = 0

    if (userPosition) {
      thisResource.Distance = distanceCalculator(userPosition.latitude, userPosition.longitude, thisResource.Latitude, thisResource.Longitude)
    }
    return thisResource
  }).sort(function compare (a, b) {
    // Sort by distance
    if (a.Distance < b.Distance) {
      return -1
    }
    if (a.Distance > b.Distance) {
      return 1
    }
    // Sort by name
    if (a['Organization Name'] < b['Organization Name']) {
      return -1
    }
    if (a['Organization Name'] > b['Organization Name']) {
      return 1
    }
    return 0
  })

  return filteredResources
}

const displayResources = function (resources) {
  // Delete existing elements
  jQuery('#resources-list').empty()

  for (let resource of resources) {
    const thisResourceID = Math.random()
    let resourceNode = jQuery(resourceItemHTML)
    resourceNode.find('a').attr('href', resource['Website'].trim())
    resourceNode.find('h3').text(resource['Organization Name'].trim())
    resourceNode.find('.resource-description').text(resource['Brief Description'].trim())
    if (resource.Distance > 0) {
      resourceNode.find('.tags').after(`<p>Distance: ${resource.Distance.toFixed(0)} miles</p>`)
    }
    resourceNode.find('.tags').after(`<p>State: ${resource.State}</p>`)

    // Construct Details Expansion
    const resourceDetailsElements = []

    if (resource['Website'].trim().length > 0) {
      resourceDetailsElements.push(`<a href="${resource['Website']}" target="_blank">${resource['Website'].match(/(https*:\/\/|^)(www\.)*([a-zA-Z0-9-.]+)/)[3]}</a>`)
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

  if (userPosition) {
    jQuery('#resources-display .button.find-resources-trigger').text('resources sorted by distance from you').removeClass('button purple-background')
    jQuery('#resources-description').text('Near You')
  }

  if (jQuery('#stateSelectionDropdown').val() && jQuery('#stateSelectionDropdown').val() !== 'select-a-state') {
    const stateCode = jQuery('#stateSelectionDropdown').val().toUpperCase()

    jQuery('#resources-description').text(`in ${statesDatabase[stateCode]}`)
  }

  if (!userPosition && (!jQuery('#stateSelectionDropdown').val() || jQuery('#stateSelectionDropdown').val() === 'select-a-state')) {
    jQuery('#resources-description').text('Nationwide')
  }
}

// Find the position of the user and save it in the browser
const findUserPosition = function (callback) {
  callback = callback || function () {}
  if (userPosition) {
    return callback()
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    userPosition = position.coords
    return callback()
  })
}

jQuery('#distance-sort').click(function () {
  jQuery('#distance-sort').text('Sorting…')

  findUserPosition(function () {
    displayResources(jQuery('#stateSelectionDropdown').val())
    jQuery('#distance-sort').text('Sorted by distance from you')
  })
})

// Display all resources when page loads
jQuery(document).ready(function () {
  displayResources(prepareResources())
})

function distanceCalculator (lat1, lon1, lat2, lon2, unit) {
  if ([typeof (lat1), typeof (lon1), typeof (lat2), typeof (lon2)].some(type => type !== 'number')) {
    return 0
  }
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0
  } else {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit === 'K') { dist = dist * 1.609344 }
    if (unit === 'N') { dist = dist * 0.8684 }
    return dist
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction () {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
}
