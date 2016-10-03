
// Chart configuration
var CHART_HEIGHT  = 350;
var BAR_THICKNESS = 8;
var BAR_PADDING   = 0.75;

// Load d3 data
d3.json(generate_uw_api_url('terms/1161/enrollment.json'), function(error, response) {
   var enrollment = decode_uw_api_response(error, response);
   if (enrollment === false) return;

   // Identify the maximum point
   var max_enrollment = d3.max(enrollment, function(course) {
      return +course.enrollment_total;
   });
   console.log('Maximum enrollment total', max_enrollment);

   // Start building the chart
   chart = d3.select('.enrollment');

   chart.attr('width', BAR_THICKNESS * enrollment.length);
   chart.attr('height', CHART_HEIGHT);

   // Setup scaling
   var y = d3.scaleLinear()
             .domain([0, max_enrollment])
             .range([0, CHART_HEIGHT]);

   var colour = d3.scaleLinear()
                  .domain([0, max_enrollment])
                  .range(['black', 'green']);

   // Draw the bars
   var tip = d3.tip()
               .attr('class', 'd3-tip')
               .offset([-10, 0])
               .html(function(course) {
                  return '<p class="center"><b>' + course.subject + course.catalog_number + '</b><br>' + course.enrollment_total + '</p>';
               });

   var bar = chart.selectAll('g')
                  .data(enrollment)
                  .enter();

   bar.append('rect')
      .attr('x', function(course, i) {
         return i * BAR_THICKNESS;
      })
      .attr('y', function(course, i) {
         return CHART_HEIGHT - y(course.enrollment_total);
      })
      .attr('height', function(course) {
         return y(course.enrollment_total);
      })
      .attr('width', BAR_THICKNESS - BAR_PADDING)
      .attr('fill', function(course) {
         return colour(course.enrollment_total);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .call(tip);

});
