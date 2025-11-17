# Política de Privacidad de Bitácora del Bebé / Baby's Log

**Última actualización:** 17 de noviembre de 2024

## Introducción

Esta Política de Privacidad describe cómo Bitácora del Bebé ("nosotros", "nuestro" o "la skill") recopila, usa y protege tu información cuando utilizas nuestra skill de Alexa.

## Información que Recopilamos

### 1. Información de Amazon Alexa
Cuando utilizas nuestra skill, recibimos:
- Tu ID de Usuario de Alexa (un identificador único asignado por Amazon)
- Comandos de voz y solicitudes que haces a la skill
- Información del dispositivo necesaria para responder a tus solicitudes

### 2. Información de la Cuenta de Google
Cuando vinculas tu cuenta de Google, recibimos:
- Token de acceso OAuth 2.0 para acceder a tus Hojas de Cálculo de Google
- Permiso para crear y modificar hojas de cálculo en tu Google Drive
- Permiso para leer metadatos de archivos (para verificar la existencia y estado de la hoja de cálculo)

### 3. Datos Almacenados por Nosotros
Almacenamos lo siguiente en nuestra base de datos segura (Amazon DynamoDB):
- Tu ID de Usuario de Alexa
- El ID de tu hoja de cálculo de Google Sheets
- URL de la hoja de cálculo
- Marcas de tiempo de creación y actualizaciones de cuenta

**Importante:** NO almacenamos ningún registro de alimentación, información del bebé o datos personales de salud en nuestros servidores. Todos los datos de alimentación se almacenan exclusivamente en TU hoja de cálculo de Google Sheets que tú posees y controlas.

## Cómo Usamos tu Información

Usamos la información recopilada para:
1. **Proporcionar el Servicio**: Crear y gestionar tu hoja de cálculo personal de seguimiento del bebé
2. **Registrar Alimentaciones**: Añadir entradas de alimentación a TU hoja de cálculo de Google Sheets
3. **Recuperar Información**: Leer datos de alimentación de TU hoja de cálculo para responder a tus consultas
4. **Mantener el Servicio**: Asociar tu cuenta de Alexa con tu hoja de cálculo de Google Sheets

## Almacenamiento y Seguridad de Datos

### Nuestros Servidores (DynamoDB)
- Almacenamos solo tu ID de Usuario de Alexa y la referencia a la hoja de cálculo
- Los datos se almacenan en AWS DynamoDB con cifrado en reposo
- El acceso está restringido y protegido por medidas de seguridad de AWS

### Tus Datos (Google Sheets)
- TODOS los registros de alimentación se almacenan en TU hoja de cálculo de Google Sheets
- Mantienes plena propiedad y control de estos datos
- Puedes acceder, modificar o eliminar esta hoja de cálculo en cualquier momento
- Solo accedemos a tu hoja de cálculo cuando utilizas la skill

## Compartir Datos con Terceros

NO:
- Vendemos tus datos a terceros
- Compartimos tus datos con anunciantes
- Usamos tus datos con fines de marketing
- Accedemos a tus archivos de Google Drive que no sean la hoja de cálculo creada por esta skill

SÍ compartimos datos con:
- **Amazon Web Services (AWS)**: Para alojar nuestro servicio (Lambda, DynamoDB)
- **Google**: Para acceder a tus Hojas de Cálculo de Google vía OAuth 2.0
- **Amazon Alexa**: Para procesar tus comandos de voz

Estos servicios se utilizan únicamente para proporcionar la funcionalidad de la skill.

## Retención y Eliminación de Datos

### Cuánto Tiempo Conservamos los Datos
- Conservamos tu ID de Usuario de Alexa y la referencia a la hoja de cálculo mientras uses la skill
- Si deshabilitas la skill, tus datos de DynamoDB permanecen durante 90 días y luego se eliminan automáticamente

### Cómo Eliminar tus Datos

**Para eliminar todos los datos:**
1. **Deshabilita la skill** en la aplicación Alexa (Configuración → Tus Skills → Bitácora del Bebé → Deshabilitar)
2. **Revoca el acceso de Google** en https://myaccount.google.com/permissions
3. **Elimina tu hoja de cálculo** en Google Drive (si deseas eliminar los registros de alimentación)

Después de deshabilitar, tus datos se eliminarán de nuestra base de datos en un plazo de 90 días. Para solicitar la eliminación inmediata, contáctanos en [TU-EMAIL@ejemplo.com].

## Privacidad de Menores

Esta skill está diseñada para rastrear información de alimentación del bebé. Sin embargo:
- La skill NO recopila información directamente de menores
- La skill es operada por padres/cuidadores que son adultos
- No se almacena información personal del niño en nuestros servidores
- Todos los datos relacionados con el bebé se almacenan en la cuenta de Google Sheets del padre/madre

## Política de Datos de Usuario de Google API Services

El uso que hace esta skill de la información recibida de las APIs de Google se adhiere a la [Política de Datos de Usuario de Google API Services](https://developers.google.com/terms/api-services-user-data-policy), incluyendo los requisitos de Uso Limitado.

Específicamente:
- Solo accedemos a las APIs de Google Sheets y metadatos de Drive
- Usamos tus datos únicamente para proporcionar funcionalidad de seguimiento de alimentación del bebé
- No transferimos tus datos de usuario de Google a terceros (excepto según sea necesario para proporcionar el servicio)
- No usamos tus datos de usuario de Google para servir anuncios

## OAuth y Vinculación de Cuenta

Cuando vinculas tu cuenta de Google:
1. Eres redirigido a la pantalla de consentimiento OAuth de Google
2. Otorgas permiso para que accedamos a tus Hojas de Cálculo de Google
3. Google nos proporciona un token de acceso (no tu contraseña)
4. Usamos este token para crear y gestionar tu hoja de cálculo
5. Puedes revocar el acceso en cualquier momento a través de la configuración de tu cuenta de Google

**Permisos Solicitados:**
- `https://www.googleapis.com/auth/spreadsheets` - Para crear y gestionar tu hoja de cálculo de alimentación
- `https://www.googleapis.com/auth/drive.metadata.readonly` - Para verificar que tu hoja de cálculo existe y no ha sido eliminada

## Transferencias Internacionales de Datos

Tus datos pueden procesarse en:
- Centros de datos de AWS (región: configurable por el administrador)
- Centros de datos de Google Cloud (según la configuración de tu cuenta de Google)

Implementamos las salvaguardias apropiadas para proteger tus datos durante las transferencias internacionales.

## Cambios a esta Política de Privacidad

Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio mediante:
- Actualización de la fecha de "Última actualización" en la parte superior de esta política
- Anuncio de cambios a través de la skill (para cambios importantes)

El uso continuado de la skill después de los cambios constituye la aceptación de la política actualizada.

## Tus Derechos

Dependiendo de tu ubicación, puedes tener derechos que incluyen:
- **Acceso**: Solicitar una copia de tus datos
- **Corrección**: Solicitar la corrección de datos inexactos
- **Eliminación**: Solicitar la eliminación de tus datos
- **Portabilidad**: Solicitar tus datos en un formato portable
- **Objeción**: Objetar ciertas actividades de procesamiento de datos

Para ejercer estos derechos, contáctanos en [TU-EMAIL@ejemplo.com].

## Contáctanos

Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos en:

**Email:** [TU-EMAIL@ejemplo.com]
**Repositorio del Proyecto:** [TU-URL-GITHUB-REPO]

## Cumplimiento

Esta skill cumple con:
- Requisitos de Privacidad de Amazon Alexa Skills
- Política de Datos de Usuario de Google API Services
- Reglamento General de Protección de Datos (GDPR) - donde sea aplicable
- Ley de Privacidad del Consumidor de California (CCPA) - donde sea aplicable

---

**Para la versión en inglés, ver:** [PRIVACY_POLICY_EN.md](PRIVACY_POLICY_EN.md)
