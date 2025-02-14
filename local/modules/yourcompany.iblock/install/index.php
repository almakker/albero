<?php
use Bitrix\Main\ModuleManager;
use Bitrix\Main\Application;
use Bitrix\Main\IO\Directory;

class yourcompany_iblock extends CModule
{
    public $MODULE_ID = "yourcompany.iblock";
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;
    
    public function __construct()
    {
        $this->MODULE_VERSION = "1.0.0";
        $this->MODULE_VERSION_DATE = "2025-02-12 00:00:00";
        $this->MODULE_NAME = "Компонент списка инфоблока";
        $this->MODULE_DESCRIPTION = "Модуль с компонентом для вывода элементов инфоблока с кешированием";
    }

    public function DoInstall()
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallFiles();
    }

    public function DoUninstall()
    {
        $this->UnInstallFiles();
        ModuleManager::unRegisterModule($this->MODULE_ID);
    }

    public function InstallFiles()
    {
        CopyDirFiles(
            __DIR__ . '/components',
            Application::getDocumentRoot() . '/bitrix/components',
            true,
            true
        );
        return true;
    }

    public function UnInstallFiles()
    {
        Directory::deleteDirectory(
            Application::getDocumentRoot() . '/bitrix/components/yourcompany/iblock.list'
        );
        return true;
    }
} 