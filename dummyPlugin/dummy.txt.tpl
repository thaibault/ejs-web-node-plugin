<%= configuration.name %>
=========================

Tests:
------

<%- tools.stringCompressStyleValue('border  1 px solid  red') %>

Configurations:
---------------

<% for (var key in configuration) { %>
    - "<%= key %>" -> <%- typeof configuration[key] === 'string' ? configuration[key] : tools.representObject(configuration[key]) %>
<% } %>
