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

<%
    list = []
    for (index = 0; index < 10; index++)
        list.push(index)
%>
<%= list.join(', ') %>
