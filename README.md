# Model v0.1.0-alpha.1

Lightweight Data Models for the front-end.

Model integrates with _Adapters_ to fetch data from custom sources (i.e. RESTful Service, SQL database, localStorage) and translates them into _Result objects_, used to describe the data within the model collection.

Model handles the flow of data between Adapters automatically via **C.R.U.D** operations, which means changes to your data models on the front end can be reflected on a back-end server, without having to write additional code.

## Examples

Defining a Model is simple. An extend method is provided to create a Model to your specification. 

```
var Users_Model = Model.extend();
```

Initialising a Model collection is even easier.
```
var users_model = new Users_Model();
```

Models are highly configurable. Config settings are passed as the first parameter to the extend method and shared properties are passed as the second parameter.

```
    var Images_Model = Model.extend({
        adapters : [
            Adapter.Restful({
                endpoint    : 'http://jsonplaceholder.typicode.com/photos',
                attribute   : null,
                attributes  : {
                    sort  : '_sort',
                    order : '_order',
                    limit : '_limit'
                },
            })
        ]
    }, {
        sample_property : 'I am a shared property, across all image models!'
    });
```