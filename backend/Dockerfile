# Utiliza la imagen base de Python
FROM python

# Copia los archivos necesarios al contenedor
COPY . .

# Establece el directorio de trabajo en el backend
# WORKDIR /backend


RUN pip install --upgrade pip

# Instala las dependencias
RUN pip install -r requirements.txt

# Expone el puerto 3000 para que el servidor sea accesible
EXPOSE 3000

# Ejecuta el servidor
CMD python server.py