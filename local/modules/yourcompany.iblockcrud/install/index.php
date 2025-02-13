<?php
use Bitrix\Main\ModuleManager;
use Bitrix\Main\Config\Option;
use Bitrix\Main\Application;
use Bitrix\Main\IO\Directory;
use YourCompany\IblockCRUD\EventHandlers;

class yourcompany_iblockcrud extends CModule
{
    public $MODULE_ID = "yourcompany.iblockcrud";
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;
    
    public function __construct()
    {
        $this->MODULE_VERSION = "1.0.0";
        $this->MODULE_VERSION_DATE = "2025-02-12 00:00:00";
        $this->MODULE_NAME = "CRUD операции с инфоблоками";
        $this->MODULE_DESCRIPTION = "Модуль для выполнения CRUD операций с инфоблоками через REST API";
    }

    public function DoInstall()
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallEvents();
    }

    public function DoUninstall()
    {
        $this->UnInstallEvents();
        ModuleManager::unRegisterModule($this->MODULE_ID);
    }

    public function InstallEvents()
    {
        EventHandlers::registerHandlers();
        return true;
    }

    public function UnInstallEvents()
    {
        $eventManager = \Bitrix\Main\EventManager::getInstance();
        $eventManager->unRegisterEventHandler(
            'iblock',
            'OnBeforeIBlockElementAdd',
            $this->MODULE_ID,
            'YourCompany\IblockCRUD\EventHandlers',
            'onBeforeIBlockElementAdd'
        );
        $eventManager->unRegisterEventHandler(
            'iblock',
            'OnBeforeIBlockElementUpdate',
            $this->MODULE_ID,
            'YourCompany\IblockCRUD\EventHandlers',
            'onBeforeIBlockElementUpdate'
        );
        return true;
    }
} 