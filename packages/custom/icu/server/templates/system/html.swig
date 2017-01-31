<div class="header">
  <div class="logo">
    ROOT
  </div>
</div>

<div class="title">
  <p>Date: {{ date | date('F jS, Y - g:i:s ') }}</p>
  <h2>{{ service }}</h2>

  <div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">
    {% autoescape false %}{{ message }}{% endautoescape %}
  </div>

</div>
