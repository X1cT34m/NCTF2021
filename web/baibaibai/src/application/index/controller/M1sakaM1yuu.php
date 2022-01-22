<?php 
/*
 * @Author: m1saka@x1ct34m
 * @blog: www.m1saka.love
 */

namespace app\index\controller;
function waf($str){
	if(preg_match("/system| |\*|union|insert|and|into|outfile|dumpfile|infile|floor|set|updatexml|extractvalue|length|exists|user|regexp|;/i", $str)){
		return true;
	}
}
class M1sakaM1yuu
{
	public function index()
	{
		$username = request()->get('username/a');
		$str = implode(',',$username);
		if (waf($str)) {
			return '<img src="http://www.m1saka.love/wp-content/uploads/2021/11/hutao.jpg" alt="hutao" />';
		}
		if($username){
			db('m1saka')->insert(['username' => $username]);
			return '啊对对对';
		}
		else {
			return '说什么我就开摆';//
		}
	}
}
