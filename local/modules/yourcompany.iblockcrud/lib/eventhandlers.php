<?php
namespace YourCompany\IblockCRUD;

use Bitrix\Main\Loader;
use Bitrix\Main\EventManager;
use Bitrix\Main\Config\Option;
use Bitrix\Main\SystemException;
use Bitrix\Main\ArgumentException;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Context;
use Bitrix\Main\Application;

class EventHandlers
{
    /** @var \CMain */
    private static $application;

    /**
     * Инициализация обработчика событий
     */
    private static function init(): void
    {
        if (self::$application === null) {
            global $APPLICATION;
            self::$application = $APPLICATION;
        }
    }

    /**
     * Добавление ошибки в стек битрикса
     * @param string $message
     */
    private static function addError(string $message): void
    {
        self::init();
        self::$application->ThrowException($message);
    }

    /**
     * Регистрация обработчиков событий
     * @return void
     */
    public static function registerHandlers(): void
    {
        try {

            $eventManager = EventManager::getInstance();
            $eventManager->addEventHandler('iblock', 'OnBeforeIBlockElementAdd', [self::class, 'onBeforeIBlockElementAdd']);
            $eventManager->addEventHandler('iblock', 'OnBeforeIBlockElementUpdate', [self::class, 'onBeforeIBlockElementUpdate']);

        } catch (\Exception $e) {
            AddMessage2Log('Ошибка регистрации обработчиков событий: ' . $e->getMessage(), 'yourcompany.iblockcrud');
        }
    }

    /**
     * Обработчик перед добавлением элемента
     * @param array &$arFields
     * @return bool
     */
    public static function onBeforeIBlockElementAdd(array &$arFields): bool
    {
        try {

            if (empty($arFields['CODE']) && !empty($arFields['NAME'])) {
                if (empty($arFields['IBLOCK_ID'])) {
                    throw new ArgumentException('Не указан ID инфоблока');
                }
                $arFields['CODE'] = self::generateUniqueCode($arFields['NAME'], $arFields['IBLOCK_ID']);
            }
            return true;

        } catch (\Exception $e) {
            self::addError(new Error($e->getMessage() ?: 'Ошибка при генерации символьного кода'));
        }

        return false;
    }

    /**
     * Обработчик перед обновлением элемента
     * @param array &$arFields
     * @return bool
     */
    public static function onBeforeIBlockElementUpdate(array &$arFields): bool
    {
        try {

            if (empty($arFields['CODE']) && !empty($arFields['NAME'])) {
                if (empty($arFields['IBLOCK_ID'])) {
                    throw new ArgumentException('Не указан ID инфоблока');
                }
                $arFields['CODE'] = self::generateUniqueCode($arFields['NAME'], $arFields['IBLOCK_ID'], $arFields['ID']);
            }
            return true;

        } catch (\Exception $e) {
            self::addError(new Error($e->getMessage() ?: 'Ошибка при генерации символьного кода'));
        }

        return false;
    }

    /**
     * Генерация уникального символьного кода
     * @param string $name
     * @param int $iblockId
     * @param int|false $currentElementId
     * @return string
     * @throws SystemException|ArgumentException|LoaderException
     */
    private static function generateUniqueCode(string $name, int $iblockId, int|false $currentElementId = false): string
    {
        try {

            if (!Loader::includeModule('iblock')) {
                throw new LoaderException('Не удалось подключить модуль iblock');
            }

            if (empty($name)) {
                throw new ArgumentException('Не указано название элемента');
            }

            $code = \CUtil::translit($name, 'ru', [
                'max_len' => 100,
                'change_case' => 'L',
                'replace_space' => '-',
                'replace_other' => '-',
                'delete_repeat_replace' => true,
                'safe_chars' => '',
            ]);

            if (empty($code)) {
                throw new SystemException('Ошибка транслитерации названия');
            }

            $originalCode = $code;
            $i = 1;
            while (self::isCodeExists($code, $iblockId, $currentElementId)) {
                $code = $originalCode . '-' . $i++;
                if ($i > 100) {
                    throw new SystemException('Превышено максимальное количество попыток генерации уникального кода');
                }
            }

            return $code;
            
        } catch (\Exception $e) {
            AddMessage2Log('Ошибка генерации символьного кода: ' . $e->getMessage(), 'yourcompany.iblockcrud');
            throw $e;
        }
    }

    /**
     * Проверка существования кода в инфоблоке
     * @param string $code
     * @param int $iblockId
     * @param int|false $currentElementId
     * @return bool
     * @throws \Exception
     */
    private static function isCodeExists(string $code, int $iblockId, int|false $currentElementId = false): bool
    {
        try {
            $filter = [
                'IBLOCK_ID' => $iblockId,
                'CODE' => $code,
            ];

            if ($currentElementId) {
                $filter['!ID'] = $currentElementId;
            }

            $element = \CIBlockElement::GetList(
                [],
                $filter,
                false,
                ['nTopCount' => 1],
                ['ID']
            );

            return (bool) $element->Fetch();

        } catch (\Exception $e) {
            AddMessage2Log('Ошибка проверки существования кода: ' . $e->getMessage(), 'yourcompany.iblockcrud');
            throw $e;
        }
    }
} 