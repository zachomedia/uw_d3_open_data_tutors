
// Chart configuration
var CHART_HEIGHT  = 350;
var BAR_THICKNESS = 8;
var BAR_PADDING   = 0.75;

// Load d3 data
d3.json(generate_uw_api_url('resources/tutors.json'), function(error, response) {
   var tutors = decode_uw_api_response(error, response);
   if (tutors === false) return;
   
   d3.json(generate_uw_api_url('terms/1161/enrollment.json'), function(error, response) {
      var enrollment = decode_uw_api_response(error, response);
      if (enrollment === false) return;

      // Find tutors per student
      var data = alasql(`
            SELECT students.subject AS subject,
                   students.catalog_number AS catalog_number,
                   SUM(tutors.tutors_count) AS tutors_count,
                   SUM(students.enrollment_total) AS enrollment_total,
                   (SUM(students.enrollment_total) / SUM(tutors.tutors_count) * 100) AS ratio
            FROM ? AS tutors
            INNER JOIN ? AS students
                         ON (tutors.subject = students.subject
                             AND tutors.catalog_number = students.catalog_number)
            WHERE tutors.tutors_count > 0
            GROUP BY students.subject, students.catalog_number
      `, [tutors, enrollment]);
      console.debug('students_per_tutor', data);

      // Identify the maximum point
      var max_ratio = d3.max(data, function(course) {
         return +course.ratio;
      });
      console.log('Maximum ratio', max_ratio);

      // Start building the chart
      chart = d3.select('.students_per_tutor');

      chart.attr('width', BAR_THICKNESS * data.length);
      chart.attr('height', CHART_HEIGHT);

      // Setup scaling
      var y = d3.scaleLinear()
                .domain([0, max_ratio])
                .range([0, CHART_HEIGHT]);

      var colour = d3.scaleLinear()
                     .domain([0, max_ratio])
                     .range(['black', 'green']);

      // Draw the bars
      var tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  .html(function(course) {
                     return '<p class="center"><b>' + course.subject + course.catalog_number + '</b><br>Enrollment: ' +
                            course.enrollment_total + '<br>Tutors: ' + course.tutors_count + '</p>';
                  });

      var bar = chart.selectAll('g')
                     .data(data)
                     .enter();

      bar.append('rect')
         .attr('x', function(course, i) {
            return i * BAR_THICKNESS;
         })
         .attr('y', function(course, i) {
            return CHART_HEIGHT - y(course.ratio);
         })
         .attr('height', function(course) {
            return y(course.ratio);
         })
         .attr('width', BAR_THICKNESS - BAR_PADDING)
         .attr('fill', function(course) {
            return colour(course.ratio);
         })
         .on('mouseover', tip.show)
         .on('mouseout', tip.hide)
         .call(tip);

   });
});