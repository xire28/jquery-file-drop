# JQuery file drop
Easy to use and unopinionated file drag and drop jquery plugin with graceful degradation

## Requirements

- JQuery 1.8.x or higher

## Note

It is recommended to use the unobtrusive driver for this plugin([behavior-file-drop-container-ujs](https://github.com/xire28/behavior-file-drop-container-ujs))

## Install

### Using Bower

```
bower install jquery-file-drop --save
```

### Using Bundler

```
source 'https://rails-assets.org' do
	gem 'rails-assets-jquery-file-drop'
end
```

## Setup with server side JS responses
### Define the form
#### HTML
Just wrap the file input in a container

`file: form.html`
```
<form action="events" method="post" role="form">
    <h1>Create event</h1>
    <div class="form-group">
        <label for="event_name">Name: </label>
        <input name="event[name]" type="text" class="form-control" id="event_name">
    </div>
    <div class="form-group">
        <label for="event_date">Date:</label>
        <input name="event[data]" type="date" class="form-control" id="event_date">
    </div>
    <div class="form-group">
        <label for="event_images">Images: </label>
        <div class="js-file-drop-container">
            <div class="row" id="files"></div>
            <div class="row">
                <h1 class="info">Drop files here or click to upload</h1>
            </div>
            <input name="event[images][]" type="file" id="event_images" multiple="true" accept="image/*" />
        </div>
    </div>
    <input name="authenticity_token" type="hidden" value="J7CBxfHalt49OSHp27hblqK20c9PgwJ108nDHX/8Cts=" />
    <button type="submit" class="btn btn-default">Submit</button>
</form>
```

#### JS

Initialize the file drop container with the upload url (required) and info url (optional)

`file: app.js`
```
$('#js-file-drop-container').fileDropContainer({
	url: '/events/new/upload',
	info: {
		url: '/events/new/upload/info'
	}
})
```

#### Upload JS response

- Retrieve the uploaded files like you would with a normal form (params, $_FILES, etc.) with the input name
- Render a JS response (content type: application/javascript) to add HTML for the files that have been uploaded

#### Info JS response

- Retrieve the files like you would with a normal form (params, $_POST/$_GET, etc.) with the input name
- Render a JS response (content type: application/javascript) to add HTML for the files that are currently uploading

Available infos for each file: 
- name
- size
- type
- last_modified

Note: You can use `jquery-remote-js-scope` to access files and upload request in the remote JS response to generate a thumbnail with data URI (base64) for example.

### Options

#### Default options

```
{ 
	contentType: 'multipart/form-data; charset=UTF-8',
    method: 'post',
    processData: false,
    tokenName: 'authenticity_token',
    info: {
        method: 'post',
        scope: {},
        scopeOnly: false
    }
}
```

Options are passed to jQuery ajax method, so it is possible to use options listed in the [documentation](http://api.jquery.com/jquery.ajax/).

- Base level: Ajax options for the upload request
- Nested in the `info` key: Ajax options for the info request

Documentation for the scope options is available [here](https://github.com/xire28/jquery-remote-js-scope).

## Setup without server side JS responses

The following events are triggered on the drop container to allow a client side view implementation

### Events

- `files:upload` parameters: `files` and `uploadRequest`
- `files:deny` parameter : `deniedFiles`

### Request 
#### Upload events

- `ajax:beforeSend`
- `ajax:success`
- `ajax:complete`
- `ajax:error`

#### Info events

- `info:ajax:beforeSend`
- `info:ajax:success`
- `info:ajax:complete`
- `info:ajax:error`

Events signatures documentated here: [jQuery-ujs documentation](https://github.com/rails/jquery-ujs/wiki/ajax)


##TODO

- [ ] Make a "Wow !" demo












