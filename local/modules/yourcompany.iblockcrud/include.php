<?php

\Bitrix\Main\Loader::registerAutoLoadClasses(
    'yourcompany.iblockcrud',
    [
        'YourCompany\IblockCRUD\Api' => 'lib/api.php',
        'YourCompany\IblockCRUD\EventHandlers' => 'lib/eventhandlers.php',
    ]
); 