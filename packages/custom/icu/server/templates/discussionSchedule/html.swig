<div class="header">
  <div class="logo">
    ICU
  </div>
</div>

<div class="title">
  <p>Date: {{ date | date('F jS, Y') }}</p>
  <h2>{{ discussion.title }}, {{ discussion.due | date('F jS, Y') }}</h2>
  <img class="image"/>

  <p>Owner: {{ discussion.assign.name }}</p>
  <p>Attendees: {{ attendees }}</p>

  <div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">
    {% autoescape false %}{{ discussion.description }}{% endautoescape %}
  </div>

  <h3>Agenda tasks: </h3>
  <ol>
    {% for task in agendaTasks %}
    <li>
      <a href="{{ uriRoot }}/tasks/by-discussion/{{ discussion._id.toString() }}/{{ task._id.toString() }}">{{ task.title}}</a>
    </li>
    {% endfor %}
  </ol>
  <h3>Additional tasks: </h3>
  <ol>
    {% for task in additionalTasks %}
    <li>
      <a href="{{ uriRoot }}/tasks/by-discussion/{{ discussion._id.toString() }}/{{ task._id.toString() }}">{{ task.title}}</a>
    </li>
    {% endfor %}
  </ol>
</div>
