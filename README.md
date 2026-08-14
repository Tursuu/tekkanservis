# Tekkan Servis

## Robot Servis Yönetim Uygulaması

Bu proje, staj sürecimde çalıştığım işyerinde robot servis işlemlerinin daha düzenli ve dijital bir şekilde takip edilebilmesi amacıyla geliştirilmiştir.

Uygulama, servis sırasında kullanılan bilgilerin tek bir sistem üzerinden kaydedilmesini, geçmiş servis kayıtlarının görüntülenmesini ve servis raporlarının oluşturulmasını sağlar.

## Özellikler

* Servis yetkilisi ve servis bilgilerini kaydetme
* Firma bilgilerini kaydetme
* Robot tipi ve seri numarası takibi
* Yapılan servis işlemlerinin kaydedilmesi
* Garanti durumu ve servis türü seçimi
* Robot yağ ihtiyacının belirtilmesi
* Robot, enjeksiyon ve Take Out çevrim sürelerinin kaydedilmesi
* Kullanılan yedek parçaların eklenmesi
* Çalışma durumu ve servis açıklamalarının kaydedilmesi
* Arıza ve yapılan işlemler için detaylı rapor oluşturma
* Geçmiş servis kayıtlarını listeleme
* Servis kayıtlarında arama yapabilme
* Kayıtları görüntüleme ve düzenleme
* Servis raporlarını PDF olarak oluşturma
* Verileri JSON formatında dışa/içe aktarma
* Mobil cihazlara uygun arayüz
* Android uygulaması olarak çalışabilme

## Kullanılan Teknolojiler

* HTML5
* CSS3
* JavaScript
* Supabase
* PostgreSQL
* Capacitor
* Android

## Proje Yapısı

```text
tekkan-servis/
├── www/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── form.js
│   │   ├── list.js
│   │   ├── pdf.js
│   │   ├── storage.js
│   │   └── supabase.js
│   ├── icons/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── android/
├── capacitor.config.json
├── package.json
└── netlify.toml
```

## Geliştirme Amacı

Projenin temel amacı, sahada gerçekleştirilen robot servis işlemlerinde kullanılan kağıt tabanlı veya dağınık kayıt yöntemlerini daha düzenli bir dijital sisteme taşımaktır.

Servis sırasında girilen bilgiler kayıt altına alınarak geçmiş servis işlemlerinin daha kolay takip edilmesi ve gerektiğinde raporlanabilmesi hedeflenmiştir.

## Staj Sürecinde Kazanımlar

Bu proje sayesinde web teknolojileri, JavaScript ile kullanıcı etkileşimleri, veri yönetimi, mobil uygulama geliştirme ve web uygulamasının Android platformuna aktarılması konularında pratik deneyim kazandım.

Ayrıca gerçek bir iş sürecine yönelik uygulama geliştirerek kullanıcı ihtiyaçlarını analiz etme, arayüz tasarlama ve farklı teknolojileri bir arada kullanma konusunda deneyim kazandım.

## Durum

**Geliştirme tamamlanmış ve test edilmiştir.**

> Bu proje staj sürecinde, çalıştığım işyerinin robot servis süreçlerine yönelik olarak geliştirilmiştir.

////////////////////////////////////////////////////////

# Tekkan Servis

## Robot Service Management Application

Tekkan Servis is a service management application developed during my internship at the company I worked for. The main purpose of the project is to digitize and organize robot service operations and make service records easier to manage.

The application allows service personnel to record service information, track previous service operations, manage spare parts and generate service reports from a single system.

## Features

* Record service personnel and service information
* Manage company information
* Track robot type and serial number
* Record performed service operations
* Specify warranty and service status
* Record robot oil requirements
* Record robot, injection and Take Out cycle times
* Add used spare parts
* Record operating status and service notes
* Create detailed fault and service reports
* View previous service records
* Search through service records
* View and edit existing records
* Generate service reports in PDF format
* Import and export data in JSON format
* Responsive and mobile-friendly interface
* Android application support

## Technologies

* HTML5
* CSS3
* JavaScript
* Supabase
* PostgreSQL
* Capacitor
* Android

## Project Structure

```text
tekkan-servis/
├── www/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── form.js
│   │   ├── list.js
│   │   ├── pdf.js
│   │   ├── storage.js
│   │   └── supabase.js
│   ├── icons/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── android/
├── capacitor.config.json
├── package.json
└── netlify.toml
```

## Purpose

The main goal of the project is to replace paper-based or fragmented service records with a centralized digital system.

The application makes it easier to record service operations, access previous records and generate reports when needed.

## What I Learned

During the development of this project, I gained practical experience with web technologies, JavaScript, database management, mobile application development and integrating web applications with Android.

I also gained experience in analyzing real-world business requirements, designing user interfaces and combining multiple technologies to build a functional application.

## Project Status

**Completed and tested.**

> This project was developed during my internship to support and digitize the robot service processes of the company where I worked.
