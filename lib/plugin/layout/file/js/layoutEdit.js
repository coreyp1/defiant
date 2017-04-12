jQuery(document).ready(function($) {
  // Get the available Widgets.
  var widgets = {};
  try {
    widgets = JSON.parse($('#LayoutEditForm input[name="widgets"]').attr('value'));
  }
  catch (e) {}

  // Get the current Region settings.
  var regions = {};
  try {
    regions = JSON.parse($('#LayoutEditForm input[name="regions"]').attr('value'));
  }
  catch (e) {}

  // Get current region list.
  var regionList = $('#LayoutEditForm textarea[name="variables"]').val().split("\n").map(function(s){return s.trim()}).filter(function(s){return s !== ''});

  // Create the GUI elements (widgetPlaceholder).
  var widgetPlaceholders = {};
  for (var widget in widgets) {
    // TODO: Escape.
    widgetPlaceholders[widget] = {html: '<li class="widgetPlaceholder" widget="' + widget + '"><div class="title">' + (widgets[widget].title || '') + '</div><div class="description">' + (widgets[widget].description || '') + '</div></li>'};
  }

  // Determine into which region the Widget should be placed.
  for (var region in regions) {
    if (regionList.indexOf(region) !== -1) {
      for (var widget of regions[region]) {
        if (widgetPlaceholders[widget]) {
          widgetPlaceholders[widget].region = region;
        }
      }
    }
  }

  // Populate the Widget lists.
  var inRegion = {};
  var noRegion = '';
  for (widget in widgetPlaceholders) {
    var region = widgetPlaceholders[widget].region;
    if (region === undefined) {
      noRegion += widgetPlaceholders[widget].html;
    }
    else {
      inRegion[region] = inRegion[region] || '';
      inRegion[region] += widgetPlaceholders[widget].html;
    }
  }

  // Put everything into the HTML.
  $('#LayoutEditForm #widgetPlacement .widgets ul').html(noRegion);
  var items = '';
  for (var region of regionList) {
    // TODO: Escape.
    items += '<div class="regionPlaceholder"><span class="regionName">' + region + '</span><ul class="drag" region="' + region + '">';
    items += inRegion[region] || '';
    items += '</ul></div>';
  }
  $('#LayoutEditForm #widgetPlacement .regions').html(items);
  
  // Make the lists draggable.
  $('#widgetPlacement ul').sortable({
    connectWith: '.drag',
    placeholder: "ui-state-highlight",
    stop: function( event, ui ) {
      // Assemble the regions object
      var regions = {};
      $("#widgetPlacement .regions ul").map(function(key, val){
        var ul = $(val);
        var region = ul.attr('region');
        regions[region] = [];
        ul.children('li').map(function(key, val){
          regions[region].push($(val).attr('widget'));
        });
      });

      // Set the hidden value in the form.
      $('#LayoutEditForm input[name="regions"]').attr('value', JSON.stringify(regions));
    }
  });
});
