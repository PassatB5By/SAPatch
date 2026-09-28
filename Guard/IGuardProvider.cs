namespace SAPatcher.Guard;

/// <summary>
/// Интерфейс для модуля защиты и интеграции лаунчера.
/// В открытой версии SAPatcher используется базовая открытая реализация.
/// Закрытый модуль защиты поставляется в виде скомпилированной библиотеки SAPatcher.Security.dll.
/// </summary>
public interface IGuardProvider
{
    string ProviderName { get; }
    string Version { get; }
    bool IsProprietary { get; }
    string GuardHeader { get; }
    string GuardFooter { get; }
    string GetGuardScript();
}
