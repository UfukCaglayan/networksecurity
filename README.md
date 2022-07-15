# Computer and Network Security

Bu depo Uludağ Üniversitesi Bilgisayar ve Ağ Güvenliği dersi için açılmıştır.

1. npm i
2. npm start

Sisteme kayıtlı olan her kullanıcı için Diffie Hellman anahtar değişim yöntemiyle public key ve private key olmak üzere iki anahtar üretilir. 
Kullanıcı arayüzünde bir başka kişiyle dosya paylaşılması istendiğinde mail adresi seçilir. Dosyalar sisteme şifreli bir şekilde yüklenilir. Şifreleme işlemi sırasında özel bir şifre oluşturma algoritmasıyla bir anahtar üretilir ve bu anahtar kullanılarak AES256 şifreleme algoritmasıyla dosya şifrelenir. Dosyanın paylaşılacağı sırada karşı tarafın public keyiyle anahtar şifrelenir. Karşı taraf dosyayı indirmek istediğinde kendi private keyi kullanılarak dosyanın şifresinin çözülmüş haline ulaşılır ve indirilir.

Uygulamadan resimler:

![networksec](https://user-images.githubusercontent.com/22642119/179255456-f291e9f0-4cad-4403-ad80-15c844a87f74.png)

Dosyalar Dropbox'ta şifreli bir şekilde tutulmaktadır ve Dropbox yetkilileri dahil dosyaların içeriğine ulaşamamaktadır.

![dropbox](https://user-images.githubusercontent.com/22642119/179257038-4d7745b1-1d35-4edb-b814-7501b663c953.png)

Firebase'de sisteme kayıtlı olan her kullanıcının mail adresleri ve kendileri için üretilen public keyler tutulur.
Bir kullanıcıyla dosya paylaşıldığında şifrelenmiş anahtarlar ve paylaşılan mail adresleri burada tutulur.

![firebase](https://user-images.githubusercontent.com/22642119/179257095-7ce15883-46ee-4bbb-84fa-147dac8d7c5c.png)


