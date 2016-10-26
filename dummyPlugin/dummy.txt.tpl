<%= configuration.name %>
===========

<% for (var key in configuration) { %>
    - "<%= key %>" -> <%- typeof configuration[key] === 'string' ? configuration[key] : tools.representObject(configuration[key]) %>
<% } %>
