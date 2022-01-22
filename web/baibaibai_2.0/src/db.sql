DROP DATABASE IF EXISTS `nctf`;
CREATE DATABASE nctf;
GRANT SELECT,INSERT,UPDATE,DELETE on nctf.* to nctf@'127.0.0.1' identified by 'nctf';
GRANT SELECT,INSERT,UPDATE,DELETE on nctf.* to nctf@localhost identified by 'nctf';
GRANT ALL PRIVILEGES on *.* to nctf@'127.0.0.1' WITH GRANT OPTION;
GRANT ALL PRIVILEGES on *.* to nctf@localhost WITH GRANT OPTION;
flush privileges;
use nctf;

CREATE TABLE `m1saka`  (
  `id` integer(9) AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(50) NULL,
  `flag_in_ffllaagg.php` varchar(100) NULL,
  `age` int(5) NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `m1saka` (`username`,`password`,`flag_in_ffllaagg.php`,`age`) VALUES ('m1saka','marry_dingnan','Admin',999);