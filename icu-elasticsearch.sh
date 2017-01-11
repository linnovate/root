#!/bin/bash

#create etc/okiano_elastic.conf in the user's home directory containing:
#PROD_ELASTIC_URI="https://httpuser:httpass@elasticip:elasticport"

case "$1" in
"production")
  if [ ! -f "$HOME/etc/okiano_elastic.conf" ] ; then
    echo "can't find $HOME/etc/okiano_elastic.conf"
    exit 1
  fi    
  source $HOME/etc/okiano_elastic.conf
  ELASTIC="$PROD_ELASTIC_URI"
  ;;
"staging")
  ELASTIC="http://localhost:9200"
  ;;
"dev")
  ELASTIC="http://localhost:9200"
  ;;
  "New_Stage") 
  ELASTIC="192.168.4.1:9200"
  ;;
  "Hotfix") 
  ELASTIC="192.168.5.2:9200"
  ;;
"ruty") 
  ELASTIC="http://okiano.local:9200"
  ;;
*)
  echo "first parameter must be either production, staging, or dev"
  echo "$0 [production | staging | dev]"
  exit 1
  ;;
esac

echo "running $0 for environment $1"


echo 'delete old indexes'
curl -XDELETE "$ELASTIC/project" 
curl -XDELETE "$ELASTIC/update" 
curl -XDELETE "$ELASTIC/task" 
curl -XDELETE "$ELASTIC/discussion" 
curl -XDELETE "$ELASTIC/attachment"
curl -XDELETE "$ELASTIC/elasticsearch_index_topdoctors_default_node_index" 
curl -XDELETE "$ELASTIC/development_collections" 
curl -XDELETE "$ELASTIC/collections" 
curl -XDELETE "$ELASTIC/records" 
curl -XDELETE "$ELASTIC/development_records" 

echo 'create indexes'
curl -XPOST "$ELASTIC/project" 
curl -XPOST "$ELASTIC/update"  
curl -XPOST "$ELASTIC/discussion" 
curl -XPOST "$ELASTIC/attachment" 
curl -XPOST "$ELASTIC/task"
curl -XPOST "$ELASTIC/elasticsearch_index_topdoctors_default_node_index"
curl -XPOST "$ELASTIC/development_collections"
curl -XPOST "$ELASTIC/collections"
curl -XPOST "$ELASTIC/records"
curl -XPOST "$ELASTIC/development_records"


sleep 2

curl -XPOST "$ELASTIC/project/_close"
echo 'update elastic project'
curl -XPUT "$ELASTIC/project/_mapping/project?ignore_conflicts=true"  -d '
{
            "properties": {
               "__v": {
                  "type": "long"
               },
               "_id": {
                  "type": "string"
               },
               "color": {
                  "type": "string"
               },
               "created": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "creator": {
                  "type": "string"
               },
               "description": {
                  "type": "string"
               },
               "discussion": {
                  "type": "string"
               },
               "id": {
                  "type": "string"
               },
               "room": {
                  "type": "string"
               },
               "star": {
                  "type": "boolean"
               },
               "status": {
                  "type": "string"
               },
               "title": {
                  "type": "string"
               },
               "update": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "updated": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "watchers": {
                  "type": "string"
               }
   }
}'

curl -XPOST "$ELASTIC/project/_open"

echo 'update elastic update'
curl -XPUT "$ELASTIC/update/_mapping/update?ignore_conflicts=true"  -d '
{
            "properties": {
               "__v": {
                  "type": "long"
               },
               "_id": {
                  "type": "string"
               },
               "created": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "creator": {
                  "type": "string"
               },
               "description": {
                  "type": "string"
               },
               "id": {
                  "type": "string"
               },
               "issue": {
                  "type": "string"
               },
               "issueId": {
                  "type": "string"
               },
               "type": {
                  "type": "string"
               },
               "updated": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               }
   }
}'

curl -XPOST "$ELASTIC/discussion/_close"
echo 'update elastic discussion'
curl -XPUT "$ELASTIC/discussion/_mapping/discussion?ignore_conflicts=true"  -d '
{
            "properties": {
               "__v": {
                  "type": "long"
               },
               "_id": {
                  "type": "string"
               },
               "assign": {
                  "type": "string"
               },
               "circles": {
                  "type": "string"
               },
               "created": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "creator": {
                  "type": "string"
               },
               "description": {
                  "type": "string"
               },
               "due": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "id": {
                  "type": "string"
               },
               "project": {
                  "type": "string"
               },
               "star": {
                  "type": "boolean"
               },
               "status": {
                  "type": "string"
               },
               "title": {
                  "type": "string"
               },
               "updated": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "watchers": {
                  "type": "string"
               }
   }
}'

curl -XPOST "$ELASTIC/discussion/_open"


curl -XPOST "$ELASTIC/attachment/_close"
echo 'update elastic attachment'
curl -XPUT "$ELASTIC/attachment/_mapping/attachment?ignore_conflicts=true"  -d '
{
"properties": {}
}'

curl -XPOST "$ELASTIC/attachment/_open"



curl -XPOST "$ELASTIC/task/_close"
echo 'update elastic task'
curl -XPUT "$ELASTIC/task/_mapping/task?ignore_conflicts=true"  -d '
{
            "properties": {
               "__v": {
                  "type": "long"
               },
               "_id": {
                  "type": "string"
               },
               "assign": {
                  "type": "string"
               },
               "created": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "creator": {
                  "type": "string"
               },
               "description": {
                  "type": "string"
               },
               "discussions": {
                  "type": "string"
               },
               "due": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "id": {
                  "type": "string"
               },
               "project": {
                  "type": "string"
               },
               "star": {
                  "type": "boolean"
               },
               "status": {
                  "type": "string"
               },
               "tags": {
                  "type": "string"
               },
               "title": {
                  "type": "string"
               },
               "updated": {
                  "type": "date",
                  "format": "strict_date_optional_time||epoch_millis"
               },
               "watchers": {
                  "type": "string"
               }
   }
}'
curl -XPOST "$ELASTIC/task/_open"

echo 'update elastic elasticsearch_index_topdoctors_default_node_index'
curl -XPUT "$ELASTIC/elasticsearch_index_topdoctors_default_node_index/_mapping/elasticsearch_index_topdoctors_default_node_index?ignore_conflicts=true"  -d '
{
            "_all": {
               "enabled": false
            },
            "properties": {
               "author": {
                  "type": "integer"
               },
               "body:value": {
                  "type": "string"
               },
               "changed": {
                  "type": "date",
                  "format": "date_time"
               },
               "created": {
                  "type": "date",
                  "format": "date_time"
               },
               "field_city": {
                  "type": "integer"
               },
               "field_clinic": {
                  "type": "integer"
               },
               "field_first_name": {
                  "type": "string"
               },
               "field_last_name": {
                  "type": "string"
               },
               "field_pronoun": {
                  "type": "string"
               },
               "field_sub_experience": {
                  "type": "integer"
               },
               "field_sub_experience:parent": {
                  "type": "integer"
               },
               "id": {
                  "type": "integer",
                  "include_in_all": false
               },
               "promote": {
                  "type": "boolean"
               },
               "search_api_language": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "sticky": {
                  "type": "boolean"
               },
               "title": {
                  "type": "string",
                  "boost": 5
               },
               "type": {
                  "type": "string",
                  "index": "not_analyzed"
               }
      
   }
}'
echo 'update elastic development_collections'
curl -XPUT "$ELASTIC/development_collections/_mapping/collection?ignore_conflicts=true"  -d '
{
            "_timestamp": {},
            "properties": {
               "id": {
                  "type": "long"
               },
               "name": {
                  "type": "string"
               },
               "private": {
                  "type": "boolean"
               }
      
   }
}'

curl -XPOST "$ELASTIC/collections/_close"
echo 'update elastic collections'
curl -XPUT "$ELASTIC/collections/_mapping/collection?ignore_conflicts=true"  -d '
{
"_timestamp": {},
            "properties": {
               "id": {
                  "type": "integer"
               },
               "name": {
                  "type": "string",
                  "boost": 3
               },
               "private": {
                  "type": "boolean"
               }
            }
         
  }'

curl -XPOST "$ELASTIC/collections/_open"


curl -XPOST "$ELASTIC/records/_close"
echo 'update elastic records'
curl -XPUT "$ELASTIC/records/_mapping/record?ignore_conflicts=true"  -d '
{
            "_timestamp": {},
            "properties": {
               "category_id": {
                  "type": "integer"
               },
               "category_is_human": {
                  "type": "boolean"
               },
               "category_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "category_slug": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "client_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "client_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "country_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "deleted_at": {
                  "type": "boolean"
               },
               "digest": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "display_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "event_ids": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "first_name": {
                  "type": "string",
                  "boost": 4
               },
               "id": {
                  "type": "integer"
               },
               "image_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "lang": {
                  "type": "string"
               },
               "lang_native": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "last_name": {
                  "type": "string",
                  "boost": 2
               },
               "middle_name": {
                  "type": "string"
               },
               "mp3_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "name_english": {
                  "type": "string",
                  "boost": 5
               },
               "name_native": {
                  "type": "string"
               },
               "primary": {
                  "type": "boolean"
               },
               "private": {
                  "type": "boolean"
               },
               "recordee_id": {
                  "type": "integer"
               },
               "recordee_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_native_lang": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_picture_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_slug": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "tag_names": {
                  "type": "string"
               },
               "tmp": {
                  "type": "boolean"
               },
               "uuid": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "votes": {
                  "type": "integer"
               },
               "website": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "wiki": {
                  "type": "string",
                  "index": "not_analyzed"
               }
            
   }
}'

curl -XPOST "$ELASTIC/records/_open"


curl -XPOST "$ELASTIC/development_records/_close"
echo 'update elastic development_records'
curl -XPUT "$ELASTIC/development_records/_mapping/record?ignore_conflicts=true"  -d '
{
            "properties": {
               "avatar_content_type": {
                  "type": "string"
               },
               "avatar_file_name": {
                  "type": "string"
               },
               "avatar_file_size": {
                  "type": "long"
               },
               "avatar_updated_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "category_id": {
                  "type": "integer"
               },
               "category_is_human": {
                  "type": "boolean"
               },
               "category_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "category_slug": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "client_id": {
                  "type": "long"
               },
               "client_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "client_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "copied_tmp_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "country_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "created_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "default": {
                  "type": "boolean"
               },
               "deleted?": {
                  "type": "boolean"
               },
               "deleted_at": {
                  "type": "boolean"
               },
               "digest": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "display_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "edit_token": {
                  "type": "string"
               },
               "embed_allowed": {
                  "type": "boolean"
               },
               "event_ids": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "expire_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "first_collection_name": {
                  "type": "string"
               },
               "first_name": {
                  "type": "string",
                  "boost": 4
               },
               "id": {
                  "type": "integer"
               },
               "image_crop_height": {
                  "type": "long"
               },
               "image_crop_width": {
                  "type": "long"
               },
               "image_crop_x": {
                  "type": "long"
               },
               "image_crop_y": {
                  "type": "long"
               },
               "image_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "inner_id": {
                  "type": "string"
               },
               "lang": {
                  "type": "string"
               },
               "lang_native": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "last_name": {
                  "type": "string",
                  "boost": 2
               },
               "middle_name": {
                  "type": "string"
               },
               "mp3_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "name_en": {
                  "type": "string"
               },
               "name_english": {
                  "type": "string",
                  "boost": 5
               },
               "name_native": {
                  "type": "string"
               },
               "picture_url": {
                  "type": "string"
               },
               "primary": {
                  "type": "boolean"
               },
               "primary_name": {
                  "type": "boolean"
               },
               "private": {
                  "type": "boolean"
               },
               "recordee_id": {
                  "type": "integer"
               },
               "recordee_name": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_native_lang": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_picture_url": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "recordee_slug": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "slug": {
                  "type": "string"
               },
               "sound_url": {
                  "type": "string"
               },
               "tag_names": {
                  "type": "string"
               },
               "tmp": {
                  "type": "boolean"
               },
               "updated_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "uuid": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "voice_content_type": {
                  "type": "string"
               },
               "voice_file_name": {
                  "type": "string"
               },
               "voice_file_size": {
                  "type": "long"
               },
               "voice_updated_at": {
                  "type": "date",
                  "format": "epoch_millis||dateOptionalTime"
               },
               "votes": {
                  "type": "integer"
               },
               "website": {
                  "type": "string",
                  "index": "not_analyzed"
               },
               "widget_render_counter": {
                  "type": "long"
               },
               "wiki": {
                  "type": "string",
                  "index": "not_analyzed"
                }
   }
}'

curl -XPOST "$ELASTIC/development_records/_open"
