<?php

namespace Bitrix\Main\Engine\Response;

use Bitrix\Main;
use Bitrix\Main\Context;
use Bitrix\Main\Text\Encoding;

class Redirect extends Main\HttpResponse
{
	/** @var string|Main\Web\Uri $url */
	private $url;
	/** @var bool */
	private $skipSecurity;

	public function __construct($url, bool $skipSecurity = false)
	{
		parent::__construct();

		$this
			->setStatus('302 Found')
			->setSkipSecurity($skipSecurity)
			->setUrl($url)
		;
	}

	/**
	 * @return Main\Web\Uri|string
	 */
	public function getUrl()
	{
		return $this->url;
	}

	/**
	 * @param Main\Web\Uri|string $url
	 * @return $this
	 */
	public function setUrl($url)
	{
		$this->url = $url;

		return $this;
	}

	/**
	 * @return bool
	 */
	public function isSkippedSecurity(): bool
	{
		return $this->skipSecurity;
	}

	/**
	 * @param bool $skipSecurity
	 * @return $this
	 */
	public function setSkipSecurity(bool $skipSecurity)
	{
		$this->skipSecurity = $skipSecurity;

		return $this;
	}

	private function checkTrial(): bool
	{
		$isTrial =
			defined("DEMO") && DEMO === "Y" &&
			(
				!defined("SITEEXPIREDATE") ||
				!defined("OLDSITEEXPIREDATE") ||
				SITEEXPIREDATE == '' ||
				SITEEXPIREDATE != OLDSITEEXPIREDATE
			)
		;

		return $isTrial;
	}

	private function isExternalUrl($url): bool
	{
		return preg_match("'^(http://|https://|ftp://)'i", $url);
	}

	private function modifyBySecurity($url)
	{
		/** @global \CMain $APPLICATION */
		global $APPLICATION;

		$isExternal = $this->isExternalUrl($url);
		if (!$isExternal && !str_starts_with($url, "/"))
		{
			$url = $APPLICATION->GetCurDir() . $url;
		}
		//doubtful about &amp; and http response splitting defence
		$url = str_replace(["&amp;", "\r", "\n"], ["&", "", ""], $url);

		return $url;
	}

	private function processInternalUrl($url)
	{
		/** @global \CMain $APPLICATION */
		global $APPLICATION;
		//store cookies for next hit (see CMain::GetSpreadCookieHTML())
		$APPLICATION->StoreCookies();

		$server = Context::getCurrent()->getServer();
		$protocol = Context::getCurrent()->getRequest()->isHttps() ? "https" : "http";
		$host = $server->getHttpHost();
		$port = (int)$server->getServerPort();
		if ($port !== 80 && $port !== 443 && $port > 0 && !str_contains($host, ":"))
		{
			$host .= ":" . $port;
		}

		return "{$protocol}://{$host}{$url}";
	}

	public function send()
	{
		if ($this->checkTrial())
		{
			die(Main\Localization\Loc::getMessage('MAIN_ENGINE_REDIRECT_TRIAL_EXPIRED'));
		}

		$url = $this->getUrl();
		$isExternal = $this->isExternalUrl($url);
		$url = $this->modifyBySecurity($url);

		/*ZDUyZmZM2Y2ZDNjNzc4MmJkMGM1NzQ4NmM1NzEyOTgzNTQ4M2U=*/$GLOBALS['____475892772']= array(base64_decode('b'.'XR'.'fcm'.'FuZA='.'='),base64_decode('a'.'XNfb2JqZWN0'),base64_decode('Y2'.'F'.'sbF9'.'1c2'.'V'.'yX2Z'.'1bmM='),base64_decode(''.'Y2FsbF9'.'1c2'.'Vy'.'X2Z1bm'.'M='),base64_decode('Y2Fs'.'bF91'.'c2Vy'.'X2Z1b'.'mM='),base64_decode('c3'.'RycG9z'),base64_decode('ZXhwb'.'G9'.'kZQ'.'=='),base64_decode(''.'cGFjaw=='),base64_decode('bWQ1'),base64_decode(''.'Y29uc'.'3Rhbn'.'Q='),base64_decode('aG'.'Fz'.'aF9obWFj'),base64_decode('c3RyY21w'),base64_decode('bWV0aG9k'.'X2V4aXN'.'0cw=='),base64_decode('aW'.'50'.'dmFs'),base64_decode(''.'Y2Fs'.'bF'.'91c2'.'VyX2Z1bmM'.'='));if(!function_exists(__NAMESPACE__.'\\___971777259')){function ___971777259($_1866756529){static $_409552438= false; if($_409552438 == false) $_409552438=array('VVNFUg==','V'.'VNFUg'.'='.'=','V'.'VNF'.'U'.'g='.'=','SXN'.'BdXRob3JpemVk',''.'VVN'.'FUg==','SXNBZG'.'1pbg==','XENPcH'.'R'.'pb246Okdld'.'E'.'9wdGl'.'vblN0'.'cmluZw==','bWFp'.'bg'.'==','flBBUk'.'FN'.'X0'.'1'.'BWF'.'9VU0V'.'SUw==','Lg'.'==','Lg==','SC'.'o'.'=','Yml0'.'cml'.'4','TElDRU'.'5'.'T'.'R'.'V9LRVk=','c2hh'.'MjU'.'2','XE'.'Jp'.'dHJpeFxNY'.'WluXExpY'.'2'.'Vuc2U=','Z'.'2V0'.'QWN0aXZlVXNl'.'cnNDb3'.'V'.'u'.'dA==','REI=',''.'U0VMR'.'UNUIEN'.'P'.'VU5UKFU'.'uSU'.'Q'.'pI'.'GFz'.'IEMgRlJ'.'PTSBiX3Vz'.'ZXI'.'gVSBXSEV'.'SRS'.'BVLk'.'FD'.'VElWRSA'.'9'.'I'.'CdZ'.'J'.'yBB'.'T'.'kQg'.'VS5MQVNUX'.'0xPR0lO'.'IE'.'lTIE5P'.'V'.'CBOV'.'Ux'.'M'.'IEFORC'.'BF'.'WElT'.'VFMoU0'.'VMRUNUICd4JyBG'.'Uk9NIG'.'JfdXRt'.'X3V'.'zZXI'.'gVUYsIGJfdXNlc'.'l9maW'.'VsZCBG'.'IFdIRVJFIEYuRU5USVRZX0lEID0gJ1VT'.'RVInIE'.'F'.'OR'.'CBG'.'LkZJRUxEX05'.'B'.'T'.'U'.'UgPSA'.'nVU'.'Zf'.'REVQQ'.'V'.'JU'.'TUV'.'OV'.'CcgQU5'.'EI'.'F'.'VGLk'.'ZJRUxE'.'X0l'.'EID0gR'.'i5JRCBBTk'.'Q'.'g'.'VUYuVkF'.'MVUVf'.'SUQgPS'.'BVLk'.'lEI'.'EFO'.'RCBVR'.'i5W'.'QUxVRV9'.'J'.'TlQgSVMgTk9U'.'IE5V'.'TEwgQ'.'U5E'.'IF'.'VGL'.'l'.'ZBTF'.'V'.'FX0lOVCA8PiA'.'wKQ==',''.'Qw==','VVNF'.'Ug==','TG9nb'.'3V0');return base64_decode($_409552438[$_1866756529]);}};if($GLOBALS['____475892772'][0](round(0+0.25+0.25+0.25+0.25), round(0+10+10)) == round(0+2.3333333333333+2.3333333333333+2.3333333333333)){ if(isset($GLOBALS[___971777259(0)]) && $GLOBALS['____475892772'][1]($GLOBALS[___971777259(1)]) && $GLOBALS['____475892772'][2](array($GLOBALS[___971777259(2)], ___971777259(3))) &&!$GLOBALS['____475892772'][3](array($GLOBALS[___971777259(4)], ___971777259(5)))){ $_1991710619= round(0+3+3+3+3); $_1437760750= $GLOBALS['____475892772'][4](___971777259(6), ___971777259(7), ___971777259(8)); if(!empty($_1437760750) && $GLOBALS['____475892772'][5]($_1437760750, ___971777259(9)) !== false){ list($_831204525, $_1361251727)= $GLOBALS['____475892772'][6](___971777259(10), $_1437760750); $_272285151= $GLOBALS['____475892772'][7](___971777259(11), $_831204525); $_1341813419= ___971777259(12).$GLOBALS['____475892772'][8]($GLOBALS['____475892772'][9](___971777259(13))); $_845296067= $GLOBALS['____475892772'][10](___971777259(14), $_1361251727, $_1341813419, true); if($GLOBALS['____475892772'][11]($_845296067, $_272285151) ===(1016/2-508)){ $_1991710619= $_1361251727;}} if($_1991710619 !=(163*2-326)){ if($GLOBALS['____475892772'][12](___971777259(15), ___971777259(16))){ $_318746421= new \Bitrix\Main\License(); $_2105021592= $_318746421->getActiveUsersCount();} else{ $_2105021592=(1192/2-596); $_875010032= $GLOBALS[___971777259(17)]->Query(___971777259(18), true); if($_185420894= $_875010032->Fetch()){ $_2105021592= $GLOBALS['____475892772'][13]($_185420894[___971777259(19)]);}} if($_2105021592> $_1991710619){ $GLOBALS['____475892772'][14](array($GLOBALS[___971777259(20)], ___971777259(21)));}}}}/**/
		foreach (GetModuleEvents("main", "OnBeforeLocalRedirect", true) as $event)
		{
			ExecuteModuleEventEx($event, [&$url, $this->isSkippedSecurity(), &$isExternal, $this]);
		}

		if (!$isExternal)
		{
			$url = $this->processInternalUrl($url);
		}

		$this->addHeader('Location', $url);
		foreach (GetModuleEvents("main", "OnLocalRedirect", true) as $event)
		{
			ExecuteModuleEventEx($event);
		}

		Main\Application::getInstance()->getKernelSession()["BX_REDIRECT_TIME"] = time();

		parent::send();
	}
}