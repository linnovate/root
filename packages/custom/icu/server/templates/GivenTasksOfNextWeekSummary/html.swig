<div class="header">
  <div class="logo">
    ICU - Given Tasks Of Next week summary
  </div>
</div>

<div class="title">
  <p>Today Date: {{ date | date('F jS, Y') }}</p>
<!--  <h2><a href="{{ uriRoot }}/tasks/by-discussion/{{ discussion._id.toString() }}"> {{ discussion.title }}</a>, {{ discussion.startDate | date('F jS, Y') }}</h2>-->
  <img class="image"/>

  <p>Owner: {{ user.name }}</p>
  
  <!-- <div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">
    {% autoescape false %}{% endautoescape %}
  </div>-->

  <!--<h3>Task discussed: </h3>
  <ol>
    {% for project in projects %}
    <li> {{ project.title }}
      <ol type="a">
        {% for task in project.tasks %}
        <li>
          <a href="{{ uriRoot }}/tasks/by-discussion/{{ discussion._id.toString() }}/{{ task._id.toString() }}">{{ task.title}}</a>
        </li>
        {% endfor %}
      </ol>
    </li>
    {% endfor %}
  </ol>-->
  <h2>Tasks: </h2>
  <ol>
    {% for task in WeekTasks %}
    <li>
      <a href="{{ uriRoot }}/tasks/all/{{ task._id.toString() }}">{{ task.title }}</a> , <b> Status Task: </b> {{ task.status }} , <b> Due Date: </b> {{ task.due | date('F jS, Y') }}  , <b> Assign: </b> {{ task.assign.name }} {{ task.assign.lastname }}
    </li>
    {% endfor %}
  </ol>
</div>
