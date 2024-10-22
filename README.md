## Testing-http-vs-https

Para poder realizar una comparativa entre el protocolo HTTP y HTTPS vamos a crear dos aplicaciones webs muy sencillas en las cuales se podrá enviar un formulario al servidor con el objeto de interceptar el tráfico y leer su contenido.

En el caso de usar el protocolo HTTP, el tráfico sin cifrar, será perfectamente legible por un tercero que se sitúe entre el cliente (navegador web) y el servidor.

Para poder poder interceptar el tráfico, usaremos la herramienta tcpdump, combinada con Wireshark.

Todas las herramientas que se expondrán a continuación se han usado en una distribución de Linux, lo cual no quiere decir que no pueda llevarse a cabo en Windows, adaptándo lo que se necesite.

Hecha esta aclaración, comenzaremos con la instalación, configuración y despliegue en local de las herramientas necesarias.

En primer lugar necesitaremos tener instalado la herramienta de gestión de contenedores, Docker.

https://docs.docker.com/engine/install/

Con Docker instalado en nuestro equipo y una vez descargado el proyecto de GitHub:
```bash
git clone https://github.com/mapereiradev/testing-http-vs-https.git
```

Ejecutaremos los siguientes comandos, situándonos respectivamente en las carpetas
* node-http:
```bash
  docker build -t node-app-http -f Dockerfile .
  docker run -d -p 8080:8080 --name node-http-container node-app-http
```
* node-https:
  Dentro de esta carpeta crearemos la carpeta ssl y ejecutaremos el siguiente comando:
```bash
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt -subj "/CN=localhost"
```

```bash
  docker build -t node-app-http -f Dockerfile .
  docker run -d -p 8443:8443 --name node-https-container node-app-https
```
Ejemplo Dockerfile:

```Dockerfile
# Usar imagen oficial
FROM node:20

# Establecer el siguiente directorio de trabajo
WORKDIR /usr/src/app

# Copiar el archivo package.json en instalar dependencias
COPY ./app/package*.json ./
RUN npm install

# Copiar el codigo fuente de la app
COPY ./app .

# Copiar el certificado SSL al contenedor
RUN mkdir -p /usr/src/app/ssl
COPY ssl/server.key ssl/server.crt /usr/src/app/ssl/

# Exponer el puerto HTTPS
EXPOSE 8443

# Establecer la variable de entorno HTTPS a verdadero
ENV HTTPS=true

# Establecer la variable de entorno PORT (puerto) a verdadero
ENV PORT=8443

# Start the HTTPS server
CMD ["node", "index.js"]

```

Comprobamos que ambos contenedores están desplegados:
```bash
docker ps
```
![](/images/docker_ps.jpg)

Ahora vamos a capturar paquetes para intentar descifrar el tráfico que enviamos desde el navegador, a través del formulario de la aplicación, hacia el servidor.


Activamos la herramienta tcpdump que filtará paquetes que vayan por el puerto 8080 (HTTP) y 8443 (HHTPS)

```bash
sudo tcpdump -i lo -w http_traffic.pcap 'tcp port 8080 or tcp port 8443'
```

Accedemos con el navegador a la direcciones siguientes, cada una en una pestaña:

```
  htttp://localhost:8080
```
```
  htttps://localhost:8443
```

Y enviamos una cadena de texto al servidor a través del formulario. Lo haremos tanto para la aplicación que usa HTTPS, como para la que usa HTTP.

- Aplicación con HTTPS:

![](/images/firefox_page01.jpg)

![](/images/firefox_page02.jpg)

![](/images/firefox_page03.jpg)

- Aplicación con HTTP:

![](/images/firefox_page04.jpg)

![](/images/firefox_page05.jpg)

![](/images/firefox_page06.jpg)

Pararemos la ejecución de tcpdump por consola usando ctrl+c. El archivo generado lo abriremos con Wireshark. _File > Open > Archivo_:

Estableceremos el filtro siguiente:

```Wireshark
  http.request.method == "POST" && tcp.port == 8080
```

<!-- ![](/images/wireshark01.jpg) -->

![](/images/wireshark02.jpg)

Como podemos observar en la captura anterior, si nos dirijimos a "HTML Form URL Encoded", observamos que servidor ha recibido la información del formulario en texto claro, sin encriptación, con lo cual si alguien interceptara nuestra comunicación con el servidor a través de la red, tendría acceso a la información que estamos enviando.


![](/images/wireshark03.jpg)

En el caso de la aplicación que usa el protocolo HTTPS, estableceremos el filtro siguiente:

```bash
  http.request.method == "POST" && tcp.port == 8443
```
Como el tráfico de red está encriptado, el filtro es incapaz de encontrar el método HTTP (POST) usado en el formulario para enviar información.

Con este sencillo ejemplo se ha pretendido demostrar lo fácil que resulta para un atacante que desee capturar nuestro de red, ver la información que enviamos a través del protocolo HTTP. Por tanto, se recomienda siempre usar HTTPS en nuestras comunicaciones a través de la web.

