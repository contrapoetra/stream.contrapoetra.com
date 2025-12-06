Since we're using an external folder to store the database, do these

```
$ docker exec -it backend.stream.contrapoetra.com id mysql
```

it will print out something like

```
uid=999(mysql) gid=1000(mysql) groups=1000(mysql)
```

and then add mysql UID printed from that command here like so

```
$ sudo chown -R <UID>:<GID> db
```

Also, when developing, we need to allow any host to connect to the database:

```
CREATE USER 'root'@'%' IDENTIFIED BY 'i.hate.sequels';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

also `sudo chmod 777 backend/htdocs/uploads/videos/* backend/htdocs/uploads/thumbnails/*` so php can actually write to those folders
