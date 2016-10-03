
// Chart configuration
var CHART_HEIGHT  = 350;
var BAR_THICKNESS = 8;
var BAR_PADDING   = 0.75;

// Load d3 data
d3.json(generate_uw_api_url('resources/tutors.json'), function(error, response) {
   var tutors = decode_uw_api_response(error, response);
   if (tutors === false) return;

   // Identify the maximum point
   var max_tutors = d3.max(tutors, function(course) {
      return +course.tutors_count;
   });
   console.log('Maximum tutor count', max_tutors);

   // Start building the chart
   chart = d3.select('.tutors');

   chart.attr('width', BAR_THICKNESS * tutors.length);
   chart.attr('height', CHART_HEIGHT);

   // Setup scaling
   var y = d3.scaleLinear()
             .domain([0, max_tutors])
             .range([0, CHART_HEIGHT]);

   var colour = d3.scaleLinear()
                  .domain([0, max_tutors])
                  .range(['black', 'green']);

   // Draw the bars
   var tip = d3.tip()
               .attr('class', 'd3-tip')
               .offset([-10, 0])
               .html(function(course) {
                  return '<p class="center"><b>' + course.subject + course.catalog_number + '</b><br>' + course.tutors_count + '</p>';
               });

   var bar = chart.selectAll('g')
                  .data(tutors)
                  .enter();

   bar.append('rect')
      .attr('x', function(course, i) {
         return i * BAR_THICKNESS;
      })
      .attr('y', function(course, i) {
         return CHART_HEIGHT - y(course.tutors_count);
      })
      .attr('height', function(course) {
         return y(course.tutors_count);
      })
      .attr('width', BAR_THICKNESS - BAR_PADDING)
      .attr('fill', function(course) {
         return colour(course.tutors_count);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .call(tip);

});
